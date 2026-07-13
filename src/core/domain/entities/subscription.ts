export type SubscriptionStatus =
  | 'active' | 'canceled' | 'past_due' | 'unpaid'
  | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function isActiveSubscription(s: Subscription): boolean {
  return s.status === 'active' || s.status === 'trialing';
}
