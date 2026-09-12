import { DomainError } from "@/core/domain/errors/domain-error";
import type { ProductRepository } from "@/core/application/ports/product-repository";
import type { PurchaseRepository } from "@/core/application/ports/purchase-repository";
import type { ProfileRepository } from "@/core/application/ports/profile-repository";
import type { AuthGateway } from "@/core/application/ports/auth-gateway";
import type { NotificationGateway } from "@/core/application/ports/notification-gateway";
import type { Logger } from "@/core/application/ports/logger";

export interface CheckoutCompletedEvent {
  sessionId: string;
  paymentIntent: string | null;
  productId: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  amountTotal: number;
  currency: string;
}

/**
 * Handles a verified `checkout.session.completed` event.
 *
 * 1. Idempotency: skip if this session was already processed.
 * 2. Find-or-create the buyer account (magic link login works right away).
 * 3. Persist the purchase → access to the product is unlocked.
 * 4. Notify n8n (WhatsApp + Email). Delivery failures never fail the webhook.
 */
export class HandleCheckoutCompleted {
  constructor(
    private readonly products: ProductRepository,
    private readonly purchases: PurchaseRepository,
    private readonly profiles: ProfileRepository,
    private readonly auth: AuthGateway,
    private readonly notifications: NotificationGateway,
    private readonly logger: Logger,
    private readonly siteUrl: string,
  ) {}

  async execute(event: CheckoutCompletedEvent): Promise<void> {
    const log = this.logger.child({ sessionId: event.sessionId });

    const existing = await this.purchases.findBySessionId(event.sessionId);
    if (existing) {
      log.info("purchase.already_processed");
      return;
    }

    const product = await this.products.findById(event.productId);
    if (!product) {
      throw new DomainError(
        "NOT_FOUND",
        `Produto ${event.productId} não existe (metadata inválida?)`,
      );
    }

    const user = await this.auth.findOrCreateUserByEmail(event.customerEmail, {
      name: event.customerName ?? undefined,
      phone: event.customerPhone ?? undefined,
    });
    log.info("purchase.user_resolved", { userId: user.id });

    // Keep profile enriched with data Stripe collected at checkout
    await this.profiles.upsert({
      id: user.id,
      name: event.customerName ?? undefined,
      phone: event.customerPhone ?? undefined,
    });

    const purchase = await this.purchases.create({
      userId: user.id,
      productId: product.id,
      stripePaymentIntent: event.paymentIntent,
      stripeSessionId: event.sessionId,
      amount: event.amountTotal,
      currency: event.currency,
      status: "paid",
    });
    log.info("purchase.created", { purchaseId: purchase.id, userId: user.id });

    try {
      await this.notifications.notifyPurchase({
        name: event.customerName,
        email: event.customerEmail,
        phone: event.customerPhone,
        product: product.title,
        amount: event.amountTotal,
        currency: event.currency,
        paymentIntent: event.paymentIntent,
        sessionId: event.sessionId,
        userId: user.id,
        libraryUrl: `${this.siteUrl}/library`,
      });
      log.info("purchase.notification_sent");
    } catch (err) {
      // Never fail the webhook because of notification delivery
      log.error("purchase.notification_failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
