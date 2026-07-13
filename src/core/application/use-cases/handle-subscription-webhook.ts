import type Stripe from 'stripe';
import type { SubscriptionStatus } from '@/core/domain/entities/subscription';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { SubscriptionRepository } from '@/core/application/ports/subscription-repository';
import type { ProfileRepository } from '@/core/application/ports/profile-repository';
import type { AuthGateway } from '@/core/application/ports/auth-gateway';
import type { Logger } from '@/core/application/ports/logger';

export class HandleSubscriptionWebhook {
  constructor(
    private readonly products: ProductRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly profiles: ProfileRepository,
    private readonly auth: AuthGateway,
    private readonly logger: Logger,
  ) {}

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.mode !== 'subscription') return;
    const productId = session.metadata?.product_id;
    const email = session.customer_details?.email ?? session.customer_email;
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const stripeSubId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!productId || !email || !stripeCustomerId || !stripeSubId) {
      this.logger.error('sub_webhook.checkout.missing_data', { sessionId: session.id });
      return;
    }

    const product = await this.products.findById(productId);
    if (!product) {
      this.logger.error('sub_webhook.checkout.product_not_found', { productId });
      return;
    }

    const user = await this.auth.findOrCreateUserByEmail(email, {
      name: session.customer_details?.name ?? undefined,
    });

    // No purchase row created — access is granted by the subscriptions table.
    // Creating a permanent purchase would bypass cancellation enforcement.
    this.logger.info('sub_webhook.checkout.completed', { userId: user.id, productId });
  }

  async handleSubscriptionUpserted(sub: Stripe.Subscription): Promise<void> {
    const productId = sub.metadata?.product_id;
    const stripeCustomerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    if (!productId) {
      this.logger.warn('sub_webhook.upserted.no_product_id', { subId: sub.id });
      return;
    }

    // Find user by existing subscription record or by customer email
    let userId: string | null = null;
    const existing = await this.subscriptions.findByStripeId(sub.id);
    if (existing) {
      userId = existing.userId;
    } else {
      // Look up customer email from any purchase with this customer context
      // We rely on checkout.session.completed running first to create the user
      const subs = await this.subscriptions.findByCustomerId(stripeCustomerId);
      if (subs.length > 0) userId = subs[0]!.userId;
    }

    if (!userId) {
      this.logger.warn('sub_webhook.upserted.no_user', { subId: sub.id, customerId: stripeCustomerId });
      return;
    }

    const item = sub.items.data[0];
    await this.subscriptions.upsert({
      userId,
      productId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      stripePriceId: item?.price.id ?? '',
      status: sub.status as SubscriptionStatus,
      // In Stripe SDK v22, current_period_start/end moved from Subscription to SubscriptionItem
      currentPeriodStart: item?.current_period_start
        ? new Date(item.current_period_start * 1000).toISOString()
        : null,
      currentPeriodEnd: item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null,
    });

    this.logger.info('sub_webhook.subscription.upserted', { subId: sub.id, status: sub.status });
  }
}
