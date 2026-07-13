import type { Subscription, SubscriptionStatus } from '@/core/domain/entities/subscription';

export interface UpsertSubscriptionInput {
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
}

export interface SubscriptionRepository {
  upsert(input: UpsertSubscriptionInput): Promise<Subscription>;
  findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null>;
  findActiveByUserProduct(userId: string, productId: string): Promise<Subscription | null>;
  findByCustomerId(stripeCustomerId: string): Promise<Subscription[]>;
  listAll(limit?: number): Promise<Subscription[]>;
  listByUser(userId: string): Promise<Subscription[]>;
}
