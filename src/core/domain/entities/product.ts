/**
 * Product — any sellable digital item. The platform is multi-product by
 * design: ebooks today, courses/bundles/subscriptions/community tomorrow.
 */
export type ProductType =
  | "ebook"
  | "course"
  | "bundle"
  | "subscription"
  | "community";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover: string | null;
  type: ProductType;
  /** Display price in cents. Checkout always resolves the Stripe Price. */
  price: number;
  currency: string;
  stripePriceId: string | null;
  /** Recurring Stripe price for subscription access. Separate from one-time stripePriceId. */
  subscriptionStripePriceId: string | null;
  active: boolean;
  createdAt: string;
}
