import { DomainError } from "@/core/domain/errors/domain-error";
import type { ProductRepository } from "@/core/application/ports/product-repository";
import type { PaymentGateway } from "@/core/application/ports/payment-gateway";
import type { Logger } from "@/core/application/ports/logger";

export interface CreateCheckoutSessionInput {
  productId: string;
  /** 'book' = livro só; 'bundle' = livro + grupo WhatsApp */
  plan?: 'book' | 'bundle';
  /** Email of the logged-in user, if any (prefills Stripe Checkout). */
  customerEmail?: string;
  siteUrl: string;
}

/**
 * Creates a Stripe Checkout Session for a product.
 *
 * Security: the frontend sends ONLY the productId. Price is resolved from
 * the product's stripe_price_id — Stripe is the source of truth for amounts.
 */
export class CreateCheckoutSession {
  constructor(
    private readonly products: ProductRepository,
    private readonly payments: PaymentGateway,
    private readonly logger: Logger,
  ) {}

  async execute(input: CreateCheckoutSessionInput): Promise<{ url: string }> {
    const product = await this.products.findById(input.productId);

    if (!product) throw new DomainError("NOT_FOUND", "Produto não encontrado");
    if (!product.active)
      throw new DomainError("FORBIDDEN", "Produto indisponível");
    const isBundle = input.plan === 'bundle';
    const priceId = isBundle ? product.bundleStripePriceId : product.stripePriceId;
    if (!priceId)
      throw new DomainError("PAYMENT", "Produto sem preço configurado");

    const session = await this.payments.createCheckoutSession({
      stripePriceId: priceId,
      productId: product.id,
      productSlug: product.slug,
      customerEmail: input.customerEmail,
      successUrl: `${input.siteUrl}/obrigado`,
      cancelUrl: `${input.siteUrl}/50dinamicas#comprar`,
    });

    this.logger.info("checkout.session_created", {
      productId: product.id,
      slug: product.slug,
      sessionId: session.sessionId,
    });

    return { url: session.url };
  }
}
