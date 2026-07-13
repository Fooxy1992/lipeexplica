import type Stripe from "stripe";
import { DomainError } from "@/core/domain/errors/domain-error";
import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  CreatePromotionCodeInput,
  CustomerPortalInput,
  PaymentGateway,
  PromotionCodeSummary,
  SubscriptionCheckoutInput,
  SyncProductPriceInput,
} from "@/core/application/ports/payment-gateway";

export class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly stripe: Stripe) {}

  async createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    // Validate the price server-side — never trust anything but Stripe
    const price = await this.stripe.prices.retrieve(input.stripePriceId);
    if (!price.active) {
      throw new DomainError("PAYMENT", "Preço inativo no Stripe");
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: input.customerEmail,
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      // metadata drives the webhook: which product to unlock
      metadata: {
        product_id: input.productId,
        product_slug: input.productSlug,
      },
      payment_intent_data: {
        metadata: {
          product_id: input.productId,
          product_slug: input.productSlug,
        },
      },
    });

    if (!session.url) {
      throw new DomainError("PAYMENT", "Stripe não retornou URL de checkout");
    }

    return { sessionId: session.id, url: session.url };
  }

  async syncProductPrice(
    input: SyncProductPriceInput,
  ): Promise<{ stripePriceId: string }> {
    // Produto ainda não existe no Stripe → cria tudo
    if (!input.stripePriceId) {
      const product = await this.stripe.products.create({
        name: input.title,
        description: input.description ?? undefined,
      });
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: input.amountCents,
        currency: input.currency,
      });
      return { stripePriceId: price.id };
    }

    const current = await this.stripe.prices.retrieve(input.stripePriceId);
    const productId =
      typeof current.product === "string" ? current.product : current.product.id;

    // Título/descrição sempre sincronizados
    await this.stripe.products.update(productId, {
      name: input.title,
      description: input.description ?? undefined,
    });

    // Valor mudou → Price novo (imutável no Stripe) + arquiva o antigo
    if (
      current.unit_amount !== input.amountCents ||
      current.currency !== input.currency
    ) {
      const fresh = await this.stripe.prices.create({
        product: productId,
        unit_amount: input.amountCents,
        currency: input.currency,
      });
      await this.stripe.prices.update(current.id, { active: false });
      return { stripePriceId: fresh.id };
    }

    return { stripePriceId: current.id };
  }

  async listPromotionCodes(): Promise<PromotionCodeSummary[]> {
    const codes = await this.stripe.promotionCodes.list({
      limit: 100,
      expand: ["data.promotion.coupon"],
    });
    return codes.data.map((pc) => toPromoSummary(pc));
  }

  async createPromotionCode(
    input: CreatePromotionCodeInput,
  ): Promise<PromotionCodeSummary> {
    if (!input.percentOff && !input.amountOffCents) {
      throw new DomainError("VALIDATION", "Informe % OU valor de desconto");
    }
    const coupon = await this.stripe.coupons.create({
      duration: "once",
      ...(input.percentOff
        ? { percent_off: input.percentOff }
        : { amount_off: input.amountOffCents, currency: "brl" }),
    });
    const pc = await this.stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code: input.code,
      max_redemptions: input.maxRedemptions,
      expires_at: input.expiresAt
        ? Math.floor(new Date(input.expiresAt).getTime() / 1000)
        : undefined,
    });
    return toPromoSummary(pc, coupon);
  }

  async setPromotionCodeActive(id: string, active: boolean): Promise<void> {
    await this.stripe.promotionCodes.update(id, { active });
  }

  async createSubscriptionCheckout(
    input: SubscriptionCheckoutInput,
  ): Promise<CheckoutSessionResult> {
    const price = await this.stripe.prices.retrieve(input.stripePriceId);
    if (!price.active) {
      throw new DomainError("PAYMENT", "Preço de assinatura inativo no Stripe");
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      customer_email: input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        product_id: input.productId,
        product_slug: input.productSlug,
      },
      subscription_data: {
        metadata: {
          product_id: input.productId,
          product_slug: input.productSlug,
        },
      },
    });

    if (!session.url) {
      throw new DomainError("PAYMENT", "Stripe não retornou URL de checkout de assinatura");
    }

    return { sessionId: session.id, url: session.url };
  }

  async createCustomerPortal(
    input: CustomerPortalInput,
  ): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: input.stripeCustomerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  }

  async refundPayment(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    } catch (err) {
      // já estornado → tratamos como sucesso (idempotência)
      const message = err instanceof Error ? err.message : String(err);
      if (/already been refunded|has already been reversed/i.test(message)) {
        return;
      }
      throw new DomainError("PAYMENT", `Estorno falhou no Stripe: ${message}`);
    }
  }
}

function toPromoSummary(
  pc: Stripe.PromotionCode,
  couponOverride?: Stripe.Coupon,
): PromotionCodeSummary {
  const raw = couponOverride ?? pc.promotion?.coupon ?? null;
  const coupon: Partial<Stripe.Coupon> =
    raw && typeof raw !== "string" ? raw : {};
  return {
    id: pc.id,
    code: pc.code,
    percentOff: coupon.percent_off ?? null,
    amountOffCents: coupon.amount_off ?? null,
    currency: coupon.currency ?? null,
    active: pc.active,
    timesRedeemed: pc.times_redeemed,
    maxRedemptions: pc.max_redemptions ?? null,
    expiresAt: pc.expires_at
      ? new Date(pc.expires_at * 1000).toISOString()
      : null,
  };
}
