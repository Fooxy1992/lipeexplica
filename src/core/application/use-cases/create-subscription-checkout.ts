import { DomainError } from '@/core/domain/errors/domain-error';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { PaymentGateway } from '@/core/application/ports/payment-gateway';
import type { Logger } from '@/core/application/ports/logger';

export interface CreateSubscriptionCheckoutInput {
  productId: string;
  customerEmail: string | undefined;
  siteUrl: string;
}

export interface CreateSubscriptionCheckoutOutput {
  url: string;
}

export class CreateSubscriptionCheckout {
  constructor(
    private readonly products: ProductRepository,
    private readonly gateway: PaymentGateway,
    private readonly logger: Logger,
  ) {}

  async execute(input: CreateSubscriptionCheckoutInput): Promise<CreateSubscriptionCheckoutOutput> {
    const product = await this.products.findById(input.productId);
    if (!product) throw new DomainError('NOT_FOUND', 'Produto não encontrado');
    if (!product.active) throw new DomainError('FORBIDDEN', 'Produto inativo');
    if (!product.stripePriceId) {
      throw new DomainError('VALIDATION', 'Produto sem plano de assinatura configurado');
    }

    this.logger.info('subscription_checkout.started', {
      productId: product.id,
      email: input.customerEmail,
    });

    const result = await this.gateway.createSubscriptionCheckout({
      stripePriceId: product.stripePriceId,
      productId: product.id,
      productSlug: product.slug,
      customerEmail: input.customerEmail,
      successUrl: `${input.siteUrl}/obrigado?session_id={CHECKOUT_SESSION_ID}&subscription=1`,
      cancelUrl: `${input.siteUrl}/${product.slug}`,
    });

    return { url: result.url };
  }
}
