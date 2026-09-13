import { DomainError } from '@/core/domain/errors/domain-error';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { ProductPlanRepository } from '@/core/application/ports/product-plan-repository';
import type { PaymentGateway } from '@/core/application/ports/payment-gateway';
import type { Logger } from '@/core/application/ports/logger';

export interface CreateSubscriptionCheckoutInput {
  productId: string;
  /** Which tier. The price behind it is resolved server-side, never sent in. */
  planSlug: string;
  customerEmail: string | undefined;
  siteUrl: string;
}

export interface CreateSubscriptionCheckoutOutput {
  url: string;
}

export class CreateSubscriptionCheckout {
  constructor(
    private readonly products: ProductRepository,
    private readonly plans: ProductPlanRepository,
    private readonly gateway: PaymentGateway,
    private readonly logger: Logger,
  ) {}

  async execute(input: CreateSubscriptionCheckoutInput): Promise<CreateSubscriptionCheckoutOutput> {
    const product = await this.products.findById(input.productId);
    if (!product) throw new DomainError('NOT_FOUND', 'Produto não encontrado');
    if (!product.active) throw new DomainError('FORBIDDEN', 'Produto inativo');

    const plan = await this.plans.findBySlug(product.id, input.planSlug);
    if (!plan) throw new DomainError('NOT_FOUND', 'Plano não encontrado');

    this.logger.info('subscription_checkout.started', {
      productId: product.id,
      plan: plan.slug,
      email: input.customerEmail,
    });

    const result = await this.gateway.createSubscriptionCheckout({
      stripePriceId: plan.stripePriceId,
      productId: product.id,
      productSlug: product.slug,
      customerEmail: input.customerEmail,
      successUrl: `${input.siteUrl}/obrigado?session_id={CHECKOUT_SESSION_ID}&subscription=1`,
      cancelUrl: `${input.siteUrl}/${product.slug}`,
    });

    return { url: result.url };
  }
}
