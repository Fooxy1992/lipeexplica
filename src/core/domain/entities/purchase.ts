export type PurchaseStatus = "pending" | "paid" | "refunded" | "failed";

/** Purchase — one row per paid Stripe Checkout Session. */
export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  stripePaymentIntent: string | null;
  stripeSessionId: string;
  /** Amount actually paid, in cents (from Stripe, never the frontend). */
  amount: number;
  currency: string;
  status: PurchaseStatus;
  createdAt: string;
}
