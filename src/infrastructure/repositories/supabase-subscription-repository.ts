import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  SubscriptionRepository,
  UpsertSubscriptionInput,
} from '@/core/application/ports/subscription-repository';
import type { Subscription } from '@/core/domain/entities/subscription';

interface SubscriptionRow {
  id: string;
  user_id: string;
  product_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeCustomerId: row.stripe_customer_id,
    stripePriceId: row.stripe_price_id,
    status: row.status as Subscription['status'],
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async upsert(input: UpsertSubscriptionInput): Promise<Subscription> {
    const { data, error } = await this.db
      .from('subscriptions')
      .upsert(
        {
          user_id: input.userId,
          product_id: input.productId,
          stripe_subscription_id: input.stripeSubscriptionId,
          stripe_customer_id: input.stripeCustomerId,
          stripe_price_id: input.stripePriceId,
          status: input.status,
          current_period_start: input.currentPeriodStart,
          current_period_end: input.currentPeriodEnd,
          cancel_at_period_end: input.cancelAtPeriodEnd,
          canceled_at: input.canceledAt,
        },
        { onConflict: 'stripe_subscription_id' },
      )
      .select('*')
      .single<SubscriptionRow>();
    if (error) throw error;
    return toSubscription(data);
  }

  async findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle<SubscriptionRow>();
    if (error) throw error;
    return data ? toSubscription(data) : null;
  }

  async findActiveByUserProduct(userId: string, productId: string): Promise<Subscription | null> {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>();
    if (error) throw error;
    return data ? toSubscription(data) : null;
  }

  async findByCustomerId(stripeCustomerId: string): Promise<Subscription[]> {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .order('created_at', { ascending: false })
      .returns<SubscriptionRow[]>();
    if (error) throw error;
    return (data ?? []).map(toSubscription);
  }

  async listAll(limit = 100): Promise<Subscription[]> {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .returns<SubscriptionRow[]>();
    if (error) throw error;
    return (data ?? []).map(toSubscription);
  }

  async listByUser(userId: string): Promise<Subscription[]> {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<SubscriptionRow[]>();
    if (error) throw error;
    return (data ?? []).map(toSubscription);
  }
}
