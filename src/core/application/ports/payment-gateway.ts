/**
 * PaymentGateway — abstracts the payment provider (Stripe today).
 * Use cases depend on this port, never on the Stripe SDK directly.
 */
export interface CheckoutSessionInput {
  stripePriceId: string;
  productId: string;
  productSlug: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/** Sincronização produto/preço com o provedor (preços são imutáveis no Stripe). */
export interface SyncProductPriceInput {
  /** Price atual (null = produto ainda não existe no provedor). */
  stripePriceId: string | null;
  title: string;
  description?: string | null;
  amountCents: number;
  currency: string;
}

export interface PromotionCodeSummary {
  id: string;
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
  currency: string | null;
  active: boolean;
  timesRedeemed: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
}

export interface CreatePromotionCodeInput {
  code: string;
  percentOff?: number;
  amountOffCents?: number;
  maxRedemptions?: number;
  /** ISO date — fim da validade. */
  expiresAt?: string;
}

export interface SubscriptionCheckoutInput {
  stripePriceId: string;
  productId: string;
  productSlug: string;
  customerEmail: string | undefined;
  successUrl: string;
  cancelUrl: string;
}

export interface CustomerPortalInput {
  stripeCustomerId: string;
  returnUrl: string;
}

export interface PaymentGateway {
  createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResult>;
  /** Estorna o pagamento no provedor. Idempotente: já estornado = sucesso. */
  refundPayment(paymentIntentId: string): Promise<void>;
  /**
   * Garante que título/descrição/preço estão refletidos no provedor.
   * Se o valor mudou, cria um Price novo e arquiva o antigo.
   * Retorna o Price ID vigente.
   */
  syncProductPrice(input: SyncProductPriceInput): Promise<{ stripePriceId: string }>;
  listPromotionCodes(): Promise<PromotionCodeSummary[]>;
  createPromotionCode(
    input: CreatePromotionCodeInput,
  ): Promise<PromotionCodeSummary>;
  setPromotionCodeActive(id: string, active: boolean): Promise<void>;
  createSubscriptionCheckout(input: SubscriptionCheckoutInput): Promise<CheckoutSessionResult>;
  createCustomerPortal(input: CustomerPortalInput): Promise<{ url: string }>;
}
