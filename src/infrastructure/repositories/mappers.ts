import type { Product } from "@/core/domain/entities/product";
import type { ProductPlan } from "@/core/domain/entities/product-plan";
import type { Purchase } from "@/core/domain/entities/purchase";
import type { Profile } from "@/core/domain/entities/profile";
import type { ReadingProgress } from "@/core/domain/entities/reading-progress";
import type {
  ProductRow,
  ProductPlanRow,
  ProfileRow,
  PurchaseRow,
  ReadingProgressRow,
} from "@/infrastructure/supabase/database.types";

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    cover: row.cover,
    type: row.type,
    price: row.price,
    currency: row.currency,
    stripePriceId: row.stripe_price_id,
    subscriptionStripePriceId: row.subscription_stripe_price_id,
    subscriptionPrice: row.subscription_price ?? null,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function toProductPlan(row: ProductPlanRow): ProductPlan {
  return {
    id: row.id,
    productId: row.product_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    stripePriceId: row.stripe_price_id,
    price: row.price,
    currency: row.currency,
    interval: row.billing_interval,
    features: row.features ?? [],
    highlight: row.highlight,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

export function toPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    stripePaymentIntent: row.stripe_payment_intent,
    stripeSessionId: row.stripe_session_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    phone: row.phone,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at ?? null,
  };
}

export function toReadingProgress(row: ReadingProgressRow): ReadingProgress {
  return {
    userId: row.user_id,
    productId: row.product_id,
    lastPage: row.last_page,
    totalPages: row.total_pages,
    visited: row.visited ?? [],
    favorites: row.favorites ?? [],
    completed: row.completed,
    lastAccessedAt: row.last_accessed_at,
  };
}
