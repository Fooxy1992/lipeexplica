/**
 * ProductPlan — one purchasable subscription tier of a product.
 *
 * Packaging lives in its own table because it churns: this product has been a
 * one-time sale, a one-time sale plus a bundle, and now two monthly tiers.
 */
export type BillingInterval = "month" | "year";

export interface ProductPlan {
  id: string;
  productId: string;
  /** Stable identifier used by the checkout API — never the display name. */
  slug: string;
  name: string;
  description: string | null;
  stripePriceId: string;
  /** Display price in cents. Stripe is the source of truth for the charge. */
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  highlight: boolean;
  sortOrder: number;
  active: boolean;
}
