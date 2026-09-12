# Preview + Subscription + Access Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-page preview gating, Stripe subscription billing, and a premium conversion screen so free users experience value then convert naturally.

**Architecture:** A `preview_access` table tracks invite-based preview users; a `subscriptions` table tracks Stripe recurring billing; `book_pages` controls which pages are visible in preview mode. `GetBookAccess` is extended to return `{ accessLevel, previewPageIndices }` and the client renders `PremiumConversionScreen` when navigating to a locked page.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + RLS), Stripe SDK v22, motion/react, Tailwind CSS, Zod, TypeScript strict.

## Global Constraints

- Stripe SDK v22 — NO `automatic_payment_methods` in TypeScript types; use `payment_method_types: ["card"]` for checkout sessions
- All monetary values in cents (integer)
- `supabase` service-role client in `adminContainer()` only — never in client components
- All access gates run server-side; client receives only what it needs (no leaked data)
- Caveman CSS palette: `--royal:#FF4D2D`, `--gold:#ffbc7c`, `--background:#131313`, class `site-dark`
- Supabase project ID: `wstgwnglafoescnhxbhu`
- `dinamicas` array in `src/data/dinamicas.ts` is 0-indexed, length 50

---

### Task 1: Database Migrations

**Files:**
- Create: `supabase/migrations/0006_subscriptions.sql`
- Create: `supabase/migrations/0007_book_pages.sql`
- Create: `supabase/migrations/0008_preview_access.sql`
- Create: `supabase/migrations/0009_analytics_events.sql`

**Interfaces:**
- Produces: tables `subscriptions`, `book_pages`, `preview_access`, `analytics_events`; updated `has_access()` SQL function; new column `invites.access_type`

- [ ] **Step 1: Create subscriptions migration**

```sql
-- supabase/migrations/0006_subscriptions.sql
-- Stripe recurring subscription tracking.
create table public.subscriptions (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        not null references auth.users(id) on delete cascade,
  product_id             uuid        not null references public.products(id) on delete restrict,
  stripe_subscription_id text        not null unique,
  stripe_customer_id     text        not null,
  stripe_price_id        text        not null,
  status                 text        not null
                         check (status in ('active','canceled','past_due','unpaid','incomplete','trialing','paused')),
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean     not null default false,
  canceled_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_subscriptions_user_id    on public.subscriptions(user_id);
create index idx_subscriptions_product_id on public.subscriptions(product_id);
create index idx_subscriptions_status     on public.subscriptions(status);
create index idx_subscriptions_stripe_sub on public.subscriptions(stripe_subscription_id);
create index idx_subscriptions_stripe_cus on public.subscriptions(stripe_customer_id);

create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "subscriptions: read own or admin"
  on public.subscriptions for select
  using (user_id = auth.uid() or public.is_admin());

-- Update has_access() to also grant access to active subscribers
create or replace function public.has_access(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    exists (
      select 1 from public.purchases
      where user_id = auth.uid()
        and product_id = p_product_id
        and status = 'paid'
    )
    or
    exists (
      select 1 from public.subscriptions
      where user_id = auth.uid()
        and product_id = p_product_id
        and status in ('active','trialing')
    )
  );
$$;
```

- [ ] **Step 2: Create book_pages migration**

```sql
-- supabase/migrations/0007_book_pages.sql
-- Per-page content metadata. preview_enabled = true → visible to preview users.
create table public.book_pages (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references public.products(id) on delete cascade,
  page_index      integer     not null check (page_index >= 0),
  preview_enabled boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(product_id, page_index)
);

create index idx_book_pages_product on public.book_pages(product_id);

create trigger trg_book_pages_updated_at before update on public.book_pages
  for each row execute function public.set_updated_at();

alter table public.book_pages enable row level security;

-- Authenticated users can read (need to check preview_enabled for access logic)
create policy "book_pages: read authenticated"
  on public.book_pages for select
  using (auth.uid() is not null);

create policy "book_pages: admin write"
  on public.book_pages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed first 5 pages (0-4) as preview for "50dinamicas" product
-- Run after product exists in DB. Uses DO block so it's idempotent.
do $$
declare
  v_product_id uuid;
begin
  select id into v_product_id from public.products where slug = '50dinamicas' limit 1;
  if v_product_id is not null then
    insert into public.book_pages (product_id, page_index, preview_enabled)
    select v_product_id, s.n, (s.n < 5)
    from generate_series(0, 49) as s(n)
    on conflict (product_id, page_index) do nothing;
  end if;
end;
$$;
```

- [ ] **Step 3: Create preview_access migration**

```sql
-- supabase/migrations/0008_preview_access.sql
-- Tracks users who redeemed a "preview" invite (partial access).
-- Add access_type column to invites first.
alter table public.invites
  add column if not exists access_type text not null default 'full'
  check (access_type in ('full', 'preview'));

-- Preview access grants: one row per user x product
create table public.preview_access (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  product_id uuid        not null references public.products(id) on delete cascade,
  invite_id  uuid        references public.invites(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index idx_preview_access_user    on public.preview_access(user_id);
create index idx_preview_access_product on public.preview_access(product_id);

alter table public.preview_access enable row level security;

create policy "preview_access: read own or admin"
  on public.preview_access for select
  using (user_id = auth.uid() or public.is_admin());
```

- [ ] **Step 4: Create analytics_events migration**

```sql
-- supabase/migrations/0009_analytics_events.sql
-- Lightweight in-product analytics (no external service needed for MVP).
create table public.analytics_events (
  id         bigserial   primary key,
  user_id    uuid        references auth.users(id) on delete set null,
  event      text        not null,
  properties jsonb       not null default '{}',
  session_id text,
  created_at timestamptz not null default now()
);

create index idx_analytics_events_user  on public.analytics_events(user_id);
create index idx_analytics_events_event on public.analytics_events(event);
create index idx_analytics_events_time  on public.analytics_events(created_at);

alter table public.analytics_events enable row level security;

-- Admin reads all; users cannot read (write-only from server)
create policy "analytics: admin read"
  on public.analytics_events for select
  using (public.is_admin());
```

- [ ] **Step 5: Apply migrations via Supabase MCP**

Apply each migration in order via `mcp__claude_ai_Supabase__apply_migration` with project_id `wstgwnglafoescnhxbhu`.

---

### Task 2: Core Entities + Ports

**Files:**
- Create: `src/core/domain/entities/subscription.ts`
- Create: `src/core/domain/entities/book-page.ts`
- Create: `src/core/domain/entities/preview-access.ts`
- Create: `src/core/domain/entities/analytics-event.ts`
- Create: `src/core/application/ports/subscription-repository.ts`
- Create: `src/core/application/ports/book-page-repository.ts`
- Create: `src/core/application/ports/preview-access-repository.ts`
- Create: `src/core/application/ports/analytics-repository.ts`
- Modify: `src/core/application/ports/payment-gateway.ts`

**Interfaces:**
- Produces: `Subscription`, `BookPage`, `PreviewAccess`, `AnalyticsEvent` types; all repository ports; `SubscriptionCheckoutInput` type in payment-gateway

- [ ] **Step 1: Create subscription entity**

```typescript
// src/core/domain/entities/subscription.ts
export type SubscriptionStatus =
  | 'active' | 'canceled' | 'past_due' | 'unpaid'
  | 'incomplete' | 'trialing' | 'paused';

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
```

- [ ] **Step 2: Create book-page entity**

```typescript
// src/core/domain/entities/book-page.ts
export interface BookPage {
  id: string;
  productId: string;
  pageIndex: number;
  previewEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Create preview-access entity**

```typescript
// src/core/domain/entities/preview-access.ts
export interface PreviewAccess {
  id: string;
  userId: string;
  productId: string;
  inviteId: string | null;
  createdAt: string;
}
```

- [ ] **Step 4: Create analytics-event entity**

```typescript
// src/core/domain/entities/analytics-event.ts
export interface AnalyticsEvent {
  id: number;
  userId: string | null;
  event: string;
  properties: Record<string, unknown>;
  sessionId: string | null;
  createdAt: string;
}

export type TrackEventInput = {
  userId: string | null;
  event: string;
  properties?: Record<string, unknown>;
  sessionId?: string | null;
};
```

- [ ] **Step 5: Create subscription-repository port**

```typescript
// src/core/application/ports/subscription-repository.ts
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
```

- [ ] **Step 6: Create book-page-repository port**

```typescript
// src/core/application/ports/book-page-repository.ts
import type { BookPage } from '@/core/domain/entities/book-page';

export interface BookPageRepository {
  findByProduct(productId: string): Promise<BookPage[]>;
  findByProductAndIndex(productId: string, pageIndex: number): Promise<BookPage | null>;
  upsert(productId: string, pageIndex: number, previewEnabled: boolean): Promise<BookPage>;
  listPreviewIndices(productId: string): Promise<number[]>;
}
```

- [ ] **Step 7: Create preview-access-repository port**

```typescript
// src/core/application/ports/preview-access-repository.ts
import type { PreviewAccess } from '@/core/domain/entities/preview-access';

export interface PreviewAccessRepository {
  grant(userId: string, productId: string, inviteId: string | null): Promise<PreviewAccess>;
  find(userId: string, productId: string): Promise<PreviewAccess | null>;
  listByUser(userId: string): Promise<PreviewAccess[]>;
}
```

- [ ] **Step 8: Create analytics-repository port**

```typescript
// src/core/application/ports/analytics-repository.ts
import type { TrackEventInput } from '@/core/domain/entities/analytics-event';

export interface AnalyticsRepository {
  track(input: TrackEventInput): Promise<void>;
}
```

- [ ] **Step 9: Extend payment-gateway port**

Add subscription methods to the existing `PaymentGateway` interface in `src/core/application/ports/payment-gateway.ts`:

```typescript
// Add to the END of src/core/application/ports/payment-gateway.ts

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

// Extend existing PaymentGateway interface:
// createSubscriptionCheckout(input: SubscriptionCheckoutInput): Promise<CheckoutSessionResult>;
// createCustomerPortal(input: CustomerPortalInput): Promise<{ url: string }>;
```

The full updated interface must include both one-time and subscription methods. Modify the `PaymentGateway` interface definition in the file to add:
```typescript
createSubscriptionCheckout(input: SubscriptionCheckoutInput): Promise<CheckoutSessionResult>;
createCustomerPortal(input: CustomerPortalInput): Promise<{ url: string }>;
```

---

### Task 3: Infrastructure Repositories + Stripe Gateway Extension

**Files:**
- Create: `src/infrastructure/repositories/supabase-subscription-repository.ts`
- Create: `src/infrastructure/repositories/supabase-book-page-repository.ts`
- Create: `src/infrastructure/repositories/supabase-preview-access-repository.ts`
- Create: `src/infrastructure/repositories/supabase-analytics-repository.ts`
- Modify: `src/infrastructure/repositories/mappers.ts`
- Modify: `src/infrastructure/stripe/stripe-payment-gateway.ts`

**Interfaces:**
- Consumes: all ports from Task 2
- Produces: concrete implementations ready for DI injection

- [ ] **Step 1: Create subscription repository**

```typescript
// src/infrastructure/repositories/supabase-subscription-repository.ts
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
```

- [ ] **Step 2: Create book-page repository**

```typescript
// src/infrastructure/repositories/supabase-book-page-repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookPageRepository } from '@/core/application/ports/book-page-repository';
import type { BookPage } from '@/core/domain/entities/book-page';

interface BookPageRow {
  id: string;
  product_id: string;
  page_index: number;
  preview_enabled: boolean;
  created_at: string;
  updated_at: string;
}

function toBookPage(row: BookPageRow): BookPage {
  return {
    id: row.id,
    productId: row.product_id,
    pageIndex: row.page_index,
    previewEnabled: row.preview_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseBookPageRepository implements BookPageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByProduct(productId: string): Promise<BookPage[]> {
    const { data, error } = await this.db
      .from('book_pages')
      .select('*')
      .eq('product_id', productId)
      .order('page_index', { ascending: true })
      .returns<BookPageRow[]>();
    if (error) throw error;
    return (data ?? []).map(toBookPage);
  }

  async findByProductAndIndex(productId: string, pageIndex: number): Promise<BookPage | null> {
    const { data, error } = await this.db
      .from('book_pages')
      .select('*')
      .eq('product_id', productId)
      .eq('page_index', pageIndex)
      .maybeSingle<BookPageRow>();
    if (error) throw error;
    return data ? toBookPage(data) : null;
  }

  async upsert(productId: string, pageIndex: number, previewEnabled: boolean): Promise<BookPage> {
    const { data, error } = await this.db
      .from('book_pages')
      .upsert(
        { product_id: productId, page_index: pageIndex, preview_enabled: previewEnabled },
        { onConflict: 'product_id,page_index' },
      )
      .select('*')
      .single<BookPageRow>();
    if (error) throw error;
    return toBookPage(data);
  }

  async listPreviewIndices(productId: string): Promise<number[]> {
    const { data, error } = await this.db
      .from('book_pages')
      .select('page_index')
      .eq('product_id', productId)
      .eq('preview_enabled', true)
      .order('page_index', { ascending: true })
      .returns<{ page_index: number }[]>();
    if (error) throw error;
    return (data ?? []).map((r) => r.page_index);
  }
}
```

- [ ] **Step 3: Create preview-access repository**

```typescript
// src/infrastructure/repositories/supabase-preview-access-repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PreviewAccessRepository } from '@/core/application/ports/preview-access-repository';
import type { PreviewAccess } from '@/core/domain/entities/preview-access';

interface PreviewAccessRow {
  id: string;
  user_id: string;
  product_id: string;
  invite_id: string | null;
  created_at: string;
}

function toPreviewAccess(row: PreviewAccessRow): PreviewAccess {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    inviteId: row.invite_id,
    createdAt: row.created_at,
  };
}

export class SupabasePreviewAccessRepository implements PreviewAccessRepository {
  constructor(private readonly db: SupabaseClient) {}

  async grant(userId: string, productId: string, inviteId: string | null): Promise<PreviewAccess> {
    const { data, error } = await this.db
      .from('preview_access')
      .upsert(
        { user_id: userId, product_id: productId, invite_id: inviteId },
        { onConflict: 'user_id,product_id' },
      )
      .select('*')
      .single<PreviewAccessRow>();
    if (error) throw error;
    return toPreviewAccess(data);
  }

  async find(userId: string, productId: string): Promise<PreviewAccess | null> {
    const { data, error } = await this.db
      .from('preview_access')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle<PreviewAccessRow>();
    if (error) throw error;
    return data ? toPreviewAccess(data) : null;
  }

  async listByUser(userId: string): Promise<PreviewAccess[]> {
    const { data, error } = await this.db
      .from('preview_access')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<PreviewAccessRow[]>();
    if (error) throw error;
    return (data ?? []).map(toPreviewAccess);
  }
}
```

- [ ] **Step 4: Create analytics repository**

```typescript
// src/infrastructure/repositories/supabase-analytics-repository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsRepository } from '@/core/application/ports/analytics-repository';
import type { TrackEventInput } from '@/core/domain/entities/analytics-event';

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async track(input: TrackEventInput): Promise<void> {
    const { error } = await this.db.from('analytics_events').insert({
      user_id: input.userId,
      event: input.event,
      properties: input.properties ?? {},
      session_id: input.sessionId ?? null,
    });
    if (error) throw error;
  }
}
```

- [ ] **Step 5: Extend Stripe gateway with subscription + portal methods**

Add to end of `src/infrastructure/stripe/stripe-payment-gateway.ts` class:

```typescript
  async createSubscriptionCheckout(
    input: SubscriptionCheckoutInput,
  ): Promise<CheckoutSessionResult> {
    const price = await this.stripe.prices.retrieve(input.stripePriceId);
    if (!price.active) throw new DomainError('PAYMENT', 'Preço inativo no Stripe');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        product_id: input.productId,
        product_slug: input.productSlug,
      },
      subscription_data: {
        metadata: {
          product_id: input.productId,
          product_slug: input.productSlug,
        },
      },
    });

    if (!session.url) throw new DomainError('PAYMENT', 'Stripe não retornou URL de checkout');
    return { sessionId: session.id, url: session.url };
  }

  async createCustomerPortal(
    input: CustomerPortalInput,
  ): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: input.stripeCustomerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  }
```

Also add the imports at the top of the file:
```typescript
import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  CreatePromotionCodeInput,
  PaymentGateway,
  PromotionCodeSummary,
  SyncProductPriceInput,
  SubscriptionCheckoutInput,
  CustomerPortalInput,
} from '@/core/application/ports/payment-gateway';
```

---

### Task 4: New Use Cases

**Files:**
- Modify: `src/core/application/use-cases/get-book-access.ts`
- Modify: `src/core/application/use-cases/get-user-library.ts`
- Create: `src/core/application/use-cases/create-subscription-checkout.ts`
- Create: `src/core/application/use-cases/handle-subscription-webhook.ts`
- Create: `src/core/application/use-cases/track-analytics-event.ts`

**Interfaces:**
- Consumes: `SubscriptionRepository`, `BookPageRepository`, `PreviewAccessRepository`, `AnalyticsRepository`, `PaymentGateway` (subscription methods)
- Produces: `BookAccess.accessLevel`, `BookAccess.previewPageIndices`; `LibraryItem.accessType`

- [ ] **Step 1: Redesign GetBookAccess**

Replace `src/core/application/use-cases/get-book-access.ts` entirely:

```typescript
// src/core/application/use-cases/get-book-access.ts
import { DomainError } from '@/core/domain/errors/domain-error';
import type { Product } from '@/core/domain/entities/product';
import type { ReadingProgress } from '@/core/domain/entities/reading-progress';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { PurchaseRepository } from '@/core/application/ports/purchase-repository';
import type { ProgressRepository } from '@/core/application/ports/progress-repository';
import type { ProfileRepository } from '@/core/application/ports/profile-repository';
import type { SubscriptionRepository } from '@/core/application/ports/subscription-repository';
import type { BookPageRepository } from '@/core/application/ports/book-page-repository';
import type { PreviewAccessRepository } from '@/core/application/ports/preview-access-repository';

export type BookAccessLevel = 'full' | 'preview';
export type BookAccessSource = 'admin' | 'subscription' | 'purchase' | 'invite';

export interface BookAccess {
  product: Product;
  progress: ReadingProgress | null;
  accessLevel: BookAccessLevel;
  accessSource: BookAccessSource;
  /** Indices of pages visible to preview users. Empty when accessLevel='full'. */
  previewPageIndices: number[];
}

export class GetBookAccess {
  constructor(
    private readonly products: ProductRepository,
    private readonly purchases: PurchaseRepository,
    private readonly progress: ProgressRepository,
    private readonly profiles: ProfileRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly bookPages: BookPageRepository,
    private readonly previewAccess: PreviewAccessRepository,
  ) {}

  async execute(userId: string, slug: string): Promise<BookAccess> {
    const product = await this.products.findBySlug(slug);
    if (!product) throw new DomainError('NOT_FOUND', 'Livro não encontrado');

    const profile = await this.profiles.findById(userId);

    // 1. Admin: always full access
    if (profile?.isAdmin) {
      const progress = await this.progress.find(userId, product.id);
      return {
        product,
        progress,
        accessLevel: 'full',
        accessSource: 'admin',
        previewPageIndices: [],
      };
    }

    if (!product.active) throw new DomainError('FORBIDDEN', 'Este produto não está mais ativo');

    // 2. Active subscription: full access
    const sub = await this.subscriptions.findActiveByUserProduct(userId, product.id);
    if (sub) {
      const progress = await this.progress.find(userId, product.id);
      return {
        product,
        progress,
        accessLevel: 'full',
        accessSource: 'subscription',
        previewPageIndices: [],
      };
    }

    // 3. One-time purchase: full access
    const owns = await this.purchases.userOwnsProduct(userId, product.id);
    if (owns) {
      const progress = await this.progress.find(userId, product.id);
      return {
        product,
        progress,
        accessLevel: 'full',
        accessSource: 'purchase',
        previewPageIndices: [],
      };
    }

    // 4. Preview invite: partial access
    const preview = await this.previewAccess.find(userId, product.id);
    if (preview) {
      const progress = await this.progress.find(userId, product.id);
      const previewPageIndices = await this.bookPages.listPreviewIndices(product.id);
      return {
        product,
        progress,
        accessLevel: 'preview',
        accessSource: 'invite',
        previewPageIndices,
      };
    }

    throw new DomainError('FORBIDDEN', 'Você não possui este produto');
  }
}
```

- [ ] **Step 2: Extend GetUserLibrary**

Add preview items to library. Replace `src/core/application/use-cases/get-user-library.ts`:

```typescript
// src/core/application/use-cases/get-user-library.ts
import type { Product } from '@/core/domain/entities/product';
import type { ReadingProgress } from '@/core/domain/entities/reading-progress';
import { progressPercent } from '@/core/domain/entities/reading-progress';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { PurchaseRepository } from '@/core/application/ports/purchase-repository';
import type { ProgressRepository } from '@/core/application/ports/progress-repository';
import type { SubscriptionRepository } from '@/core/application/ports/subscription-repository';
import type { PreviewAccessRepository } from '@/core/application/ports/preview-access-repository';

export type LibraryAccessType = 'premium' | 'preview' | 'admin';

export interface LibraryItem {
  product: Product;
  purchasedAt: string | null;
  progress: ReadingProgress | null;
  progressPct: number;
  lastAccessedAt: string | null;
  viaAdmin: boolean;
  accessType: LibraryAccessType;
}

export class GetUserLibrary {
  constructor(
    private readonly products: ProductRepository,
    private readonly purchases: PurchaseRepository,
    private readonly progress: ProgressRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly previewAccess: PreviewAccessRepository,
  ) {}

  async execute(userId: string, isAdmin = false): Promise<LibraryItem[]> {
    const [userPurchases, userSubs, userPreviews, allProgress] = await Promise.all([
      this.purchases.listByUser(userId),
      this.subscriptions.listByUser(userId),
      this.previewAccess.listByUser(userId),
      this.progress.listByUser(userId),
    ]);

    const paid = userPurchases.filter((p) => p.status === 'paid');
    const activeSubs = userSubs.filter((s) => s.status === 'active' || s.status === 'trialing');
    const progressByProduct = new Map(allProgress.map((p) => [p.productId, p]));
    const fullAccessIds = new Set([
      ...paid.map((p) => p.productId),
      ...activeSubs.map((s) => s.productId),
    ]);

    const result: LibraryItem[] = [];

    // Full access via purchases
    for (const purchase of paid) {
      const product = await this.products.findById(purchase.productId);
      if (!product || (!product.active && !isAdmin)) continue;
      const prog = progressByProduct.get(product.id) ?? null;
      result.push({
        product,
        purchasedAt: purchase.createdAt,
        progress: prog,
        progressPct: progressPercent(prog),
        lastAccessedAt: prog?.lastAccessedAt ?? null,
        viaAdmin: false,
        accessType: 'premium',
      });
    }

    // Full access via subscriptions (not already covered by purchase)
    for (const sub of activeSubs) {
      if (paid.some((p) => p.productId === sub.productId)) continue;
      const product = await this.products.findById(sub.productId);
      if (!product || !product.active) continue;
      const prog = progressByProduct.get(product.id) ?? null;
      result.push({
        product,
        purchasedAt: sub.createdAt,
        progress: prog,
        progressPct: progressPercent(prog),
        lastAccessedAt: prog?.lastAccessedAt ?? null,
        viaAdmin: false,
        accessType: 'premium',
      });
    }

    // Preview access via invite
    for (const pa of userPreviews) {
      if (fullAccessIds.has(pa.productId)) continue;
      const product = await this.products.findById(pa.productId);
      if (!product || !product.active) continue;
      const prog = progressByProduct.get(product.id) ?? null;
      result.push({
        product,
        purchasedAt: pa.createdAt,
        progress: prog,
        progressPct: progressPercent(prog),
        lastAccessedAt: prog?.lastAccessedAt ?? null,
        viaAdmin: false,
        accessType: 'preview',
      });
    }

    // Admin: sees all active products not already listed
    if (isAdmin) {
      const active = await this.products.listActive();
      for (const product of active) {
        if (fullAccessIds.has(product.id) || userPreviews.some((p) => p.productId === product.id))
          continue;
        const prog = progressByProduct.get(product.id) ?? null;
        result.push({
          product,
          purchasedAt: null,
          progress: prog,
          progressPct: progressPercent(prog),
          lastAccessedAt: prog?.lastAccessedAt ?? null,
          viaAdmin: true,
          accessType: 'admin',
        });
      }
    }

    return result;
  }
}
```

- [ ] **Step 3: Create CreateSubscriptionCheckout use case**

```typescript
// src/core/application/use-cases/create-subscription-checkout.ts
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
```

- [ ] **Step 4: Create HandleSubscriptionWebhook use case**

```typescript
// src/core/application/use-cases/handle-subscription-webhook.ts
import type Stripe from 'stripe';
import { DomainError } from '@/core/domain/errors/domain-error';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { PurchaseRepository } from '@/core/application/ports/purchase-repository';
import type { SubscriptionRepository } from '@/core/application/ports/subscription-repository';
import type { ProfileRepository } from '@/core/application/ports/profile-repository';
import type { AuthGateway } from '@/core/application/ports/auth-gateway';
import type { Logger } from '@/core/application/ports/logger';

export class HandleSubscriptionWebhook {
  constructor(
    private readonly products: ProductRepository,
    private readonly purchases: PurchaseRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly profiles: ProfileRepository,
    private readonly auth: AuthGateway,
    private readonly logger: Logger,
  ) {}

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.mode !== 'subscription') return;
    const productId = session.metadata?.product_id;
    const email = session.customer_details?.email ?? session.customer_email;
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const stripeSubId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!productId || !email || !stripeCustomerId || !stripeSubId) {
      this.logger.error('sub_webhook.checkout.missing_data', { sessionId: session.id });
      return;
    }

    const product = await this.products.findById(productId);
    if (!product) {
      this.logger.error('sub_webhook.checkout.product_not_found', { productId });
      return;
    }

    const user = await this.auth.findOrCreateUserByEmail(email, {
      name: session.customer_details?.name ?? undefined,
    });

    // Create purchase row for library and has_access() compatibility
    const alreadyOwns = await this.purchases.userOwnsProduct(user.id, productId);
    if (!alreadyOwns) {
      await this.purchases.create({
        userId: user.id,
        productId,
        stripePaymentIntent: null,
        stripeSessionId: session.id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? 'brl',
        status: 'paid',
      });
    }

    this.logger.info('sub_webhook.checkout.completed', { userId: user.id, productId });
  }

  async handleSubscriptionUpserted(sub: Stripe.Subscription): Promise<void> {
    const productId = sub.metadata?.product_id;
    const stripeCustomerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    if (!productId) {
      this.logger.warn('sub_webhook.upserted.no_product_id', { subId: sub.id });
      return;
    }

    // Find user by existing subscription record or by customer email
    let userId: string | null = null;
    const existing = await this.subscriptions.findByStripeId(sub.id);
    if (existing) {
      userId = existing.userId;
    } else {
      // Look up customer email from any purchase with this customer context
      // We rely on checkout.session.completed running first to create the user
      const subs = await this.subscriptions.findByCustomerId(stripeCustomerId);
      if (subs.length > 0) userId = subs[0]!.userId;
    }

    if (!userId) {
      this.logger.warn('sub_webhook.upserted.no_user', { subId: sub.id, customerId: stripeCustomerId });
      return;
    }

    const item = sub.items.data[0];
    await this.subscriptions.upsert({
      userId,
      productId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      stripePriceId: item?.price.id ?? '',
      status: sub.status as any,
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start * 1000).toISOString()
        : null,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null,
    });

    this.logger.info('sub_webhook.subscription.upserted', { subId: sub.id, status: sub.status });
  }
}
```

- [ ] **Step 5: Create TrackAnalyticsEvent use case**

```typescript
// src/core/application/use-cases/track-analytics-event.ts
import type { AnalyticsRepository } from '@/core/application/ports/analytics-repository';
import type { TrackEventInput } from '@/core/domain/entities/analytics-event';

export class TrackAnalyticsEvent {
  constructor(private readonly analytics: AnalyticsRepository) {}

  async execute(input: TrackEventInput): Promise<void> {
    await this.analytics.track(input);
  }
}
```

---

### Task 5: DI Container + Convite Action Update

**Files:**
- Modify: `src/infrastructure/di/container.ts`
- Modify: `src/app/convite/actions.ts`

**Interfaces:**
- Consumes: all new repos + use cases from Tasks 3 + 4
- Produces: updated `userScopedContainer()` and `adminContainer()` with new deps

- [ ] **Step 1: Update container.ts**

Replace `src/infrastructure/di/container.ts`:

```typescript
// src/infrastructure/di/container.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/infrastructure/supabase/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/supabase-product-repository';
import { SupabasePurchaseRepository } from '@/infrastructure/repositories/supabase-purchase-repository';
import { SupabaseProfileRepository } from '@/infrastructure/repositories/supabase-profile-repository';
import { SupabaseProgressRepository } from '@/infrastructure/repositories/supabase-progress-repository';
import { SupabaseSubscriptionRepository } from '@/infrastructure/repositories/supabase-subscription-repository';
import { SupabaseBookPageRepository } from '@/infrastructure/repositories/supabase-book-page-repository';
import { SupabasePreviewAccessRepository } from '@/infrastructure/repositories/supabase-preview-access-repository';
import { SupabaseAnalyticsRepository } from '@/infrastructure/repositories/supabase-analytics-repository';
import { SupabaseAuthGateway } from '@/infrastructure/supabase/supabase-auth-gateway';
import { StripePaymentGateway } from '@/infrastructure/stripe/stripe-payment-gateway';
import { getStripe } from '@/infrastructure/stripe/stripe-client';
import { N8nNotificationGateway } from '@/infrastructure/n8n/n8n-notification-gateway';
import { ConsoleLogger } from '@/infrastructure/logging/console-logger';
import { CreateCheckoutSession } from '@/core/application/use-cases/create-checkout-session';
import { CreateSubscriptionCheckout } from '@/core/application/use-cases/create-subscription-checkout';
import { HandleCheckoutCompleted } from '@/core/application/use-cases/handle-checkout-completed';
import { HandleSubscriptionWebhook } from '@/core/application/use-cases/handle-subscription-webhook';
import { GetUserLibrary } from '@/core/application/use-cases/get-user-library';
import { GetBookAccess } from '@/core/application/use-cases/get-book-access';
import { SaveReadingProgress } from '@/core/application/use-cases/save-reading-progress';
import { TrackAnalyticsEvent } from '@/core/application/use-cases/track-analytics-event';
import { publicEnv, serverEnv } from '@/lib/env';

export const logger = new ConsoleLogger({ app: 'lipeexplica' });

function buildRepos(db: SupabaseClient) {
  return {
    products: new SupabaseProductRepository(db),
    purchases: new SupabasePurchaseRepository(db),
    profiles: new SupabaseProfileRepository(db),
    progress: new SupabaseProgressRepository(db),
    subscriptions: new SupabaseSubscriptionRepository(db),
    bookPages: new SupabaseBookPageRepository(db),
    previewAccess: new SupabasePreviewAccessRepository(db),
    analytics: new SupabaseAnalyticsRepository(db),
  };
}

export async function userScopedContainer() {
  const db = await createSupabaseServerClient();
  const repos = buildRepos(db);
  return {
    db,
    ...repos,
    getUserLibrary: new GetUserLibrary(
      repos.products,
      repos.purchases,
      repos.progress,
      repos.subscriptions,
      repos.previewAccess,
    ),
    getBookAccess: new GetBookAccess(
      repos.products,
      repos.purchases,
      repos.progress,
      repos.profiles,
      repos.subscriptions,
      repos.bookPages,
      repos.previewAccess,
    ),
    saveReadingProgress: new SaveReadingProgress(
      repos.purchases,
      repos.progress,
      repos.profiles,
    ),
    trackAnalyticsEvent: new TrackAnalyticsEvent(repos.analytics),
    get createCheckoutSession() {
      return new CreateCheckoutSession(
        repos.products,
        new StripePaymentGateway(getStripe()),
        logger,
      );
    },
    get createSubscriptionCheckout() {
      return new CreateSubscriptionCheckout(
        repos.products,
        new StripePaymentGateway(getStripe()),
        logger,
      );
    },
  };
}

export function adminContainer() {
  const db = createSupabaseAdminClient();
  const repos = buildRepos(db);
  const env = serverEnv();
  const auth = new SupabaseAuthGateway(db);
  return {
    db,
    ...repos,
    get payments() {
      return new StripePaymentGateway(getStripe());
    },
    handleCheckoutCompleted: new HandleCheckoutCompleted(
      repos.products,
      repos.purchases,
      repos.profiles,
      auth,
      new N8nNotificationGateway(
        env.N8N_PAYMENT_WEBHOOK_URL,
        env.N8N_WEBHOOK_TOKEN,
        logger,
      ),
      logger,
      publicEnv.NEXT_PUBLIC_SITE_URL,
    ),
    handleSubscriptionWebhook: new HandleSubscriptionWebhook(
      repos.products,
      repos.purchases,
      repos.subscriptions,
      repos.profiles,
      auth,
      logger,
    ),
  };
}
```

- [ ] **Step 2: Update convite/actions.ts for preview invites**

In `src/app/convite/actions.ts`, after finding the invite, check its `access_type`. If `'preview'`, grant `preview_access` instead of creating a purchase. Add to the file's imports and modify the grant logic:

```typescript
// After the "Concede o acesso" comment, replace:
  const purchases = new SupabasePurchaseRepository(admin);
  const alreadyOwns = await purchases.userOwnsProduct(userId, invite.product_id);
  if (!alreadyOwns) {
    await purchases.create({ ... });
    await admin.from('invites').update({ used_count: invite.used_count + 1 }).eq('id', invite.id);
  }

// With:
  if (invite.access_type === 'preview') {
    // Preview invite: grant partial access (not a full purchase)
    const { data: existing } = await admin
      .from('preview_access')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', invite.product_id)
      .maybeSingle();
    if (!existing) {
      await admin
        .from('preview_access')
        .insert({ user_id: userId, product_id: invite.product_id, invite_id: invite.id });
      await admin
        .from('invites')
        .update({ used_count: invite.used_count + 1 })
        .eq('id', invite.id);
    }
  } else {
    // Full invite: original behavior
    const purchases = new SupabasePurchaseRepository(admin);
    const alreadyOwns = await purchases.userOwnsProduct(userId, invite.product_id);
    if (!alreadyOwns) {
      await purchases.create({
        userId,
        productId: invite.product_id,
        stripePaymentIntent: null,
        stripeSessionId: `invite-${invite.id}-${crypto.randomUUID()}`,
        amount: 0,
        currency: 'brl',
        status: 'paid',
      });
      await admin
        .from('invites')
        .update({ used_count: invite.used_count + 1 })
        .eq('id', invite.id);
    }
  }
```

Also update the InviteRow type to include `access_type`:
```typescript
interface InviteRow {
  id: string;
  product_id: string;
  max_uses: number;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  access_type: 'full' | 'preview';
}
```

And the select query:
```typescript
.select('id, product_id, max_uses, used_count, active, expires_at, access_type')
```

---

### Task 6: Webhook + API Routes

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/api/checkout/subscription/route.ts`
- Create: `src/app/api/portal/route.ts`
- Create: `src/app/api/analytics/event/route.ts`

**Interfaces:**
- Consumes: `adminContainer().handleSubscriptionWebhook`, `userScopedContainer().createSubscriptionCheckout`
- Produces: working API endpoints for subscription flow

- [ ] **Step 1: Extend webhook to handle 8 subscription events**

Replace `src/app/api/stripe/webhook/route.ts`:

```typescript
// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret } from '@/infrastructure/stripe/stripe-client';
import { adminContainer, logger } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const log = logger.child({ scope: 'stripe.webhook' });

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  } catch (err) {
    log.warn('webhook.invalid_signature', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const c = adminContainer();

  const { data: seen } = await c.db
    .from('webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();
  if (seen) {
    log.info('webhook.duplicate_event', { eventId: event.id });
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      // ---- ONE-TIME PAYMENT ----
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          const productId = session.metadata?.product_id;
          const email = session.customer_details?.email ?? session.customer_email;
          if (productId && email) {
            await c.handleCheckoutCompleted.execute({
              sessionId: session.id,
              paymentIntent:
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : (session.payment_intent?.id ?? null),
              productId,
              customerEmail: email,
              customerName: session.customer_details?.name ?? null,
              customerPhone: session.customer_details?.phone ?? null,
              amountTotal: session.amount_total ?? 0,
              currency: session.currency ?? 'brl',
            });
          }
        }
        // Subscription checkout: create subscription + user
        if (session.mode === 'subscription') {
          await c.handleSubscriptionWebhook.handleCheckoutCompleted(session);
        }
        break;
      }

      // ---- SUBSCRIPTION LIFECYCLE ----
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted(event.data.object);
        break;

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted({ ...sub, status: 'canceled' });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const stripeSubId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (stripeSubId) {
          const existing = await c.subscriptions.findByStripeId(stripeSubId);
          if (existing) {
            await c.subscriptions.upsert({ ...existing, status: 'active' });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeSubId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (stripeSubId) {
          const existing = await c.subscriptions.findByStripeId(stripeSubId);
          if (existing) {
            await c.subscriptions.upsert({ ...existing, status: 'past_due' });
          }
        }
        break;
      }

      case 'customer.subscription.paused': {
        const sub = event.data.object;
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted({ ...sub, status: 'paused' });
        break;
      }

      case 'customer.subscription.resumed': {
        const sub = event.data.object;
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted({ ...sub, status: 'active' });
        break;
      }

      case 'customer.subscription.trial_will_end':
        log.info('webhook.trial_will_end', { subId: event.data.object.id });
        break;

      default:
        log.info('webhook.ignored_event', { type: event.type });
    }

    await c.db.from('webhook_events').insert({
      id: event.id,
      type: event.type,
      payload: { livemode: event.livemode },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    log.error('webhook.processing_failed', {
      eventId: event.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create subscription checkout route**

```typescript
// src/app/api/checkout/subscription/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { userScopedContainer, logger } from '@/infrastructure/di/container';
import { createRateLimiter, clientIp } from '@/infrastructure/security/rate-limit';
import { DomainError, httpStatusFor } from '@/core/domain/errors/domain-error';
import { publicEnv } from '@/lib/env';

export const runtime = 'nodejs';

const bodySchema = z.object({ productId: z.string().uuid() });
const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = limiter.check(`checkout-sub:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde um instante.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    );
  }

  let productId: string;
  try {
    const json = await request.json();
    productId = bodySchema.parse(json).productId;
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 422 });
  }

  try {
    const c = await userScopedContainer();
    const { data: { user } } = await c.db.auth.getUser();

    const { url } = await c.createSubscriptionCheckout.execute({
      productId,
      customerEmail: user?.email,
      siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
    });

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof DomainError) {
      logger.warn('checkout_sub.domain_error', { code: err.code, message: err.message });
      return NextResponse.json({ error: err.message }, { status: httpStatusFor[err.code] });
    }
    logger.error('checkout_sub.unexpected_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Erro ao iniciar assinatura' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create customer portal route**

```typescript
// src/app/api/portal/route.ts
import { NextResponse } from 'next/server';
import { adminContainer, userScopedContainer, logger } from '@/infrastructure/di/container';
import { publicEnv } from '@/lib/env';

export const runtime = 'nodejs';

/** POST /api/portal — returns Stripe Customer Portal URL for logged-in user. */
export async function POST(request: Request) {
  try {
    const c = await userScopedContainer();
    const { data: { user } } = await c.db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    // Find active subscription to get stripe_customer_id
    const subs = await c.subscriptions.listByUser(user.id);
    const active = subs.find((s) => s.status === 'active' || s.status === 'trialing');
    if (!active) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 404 });
    }

    const adm = adminContainer();
    const { url } = await adm.payments.createCustomerPortal({
      stripeCustomerId: active.stripeCustomerId,
      returnUrl: `${publicEnv.NEXT_PUBLIC_SITE_URL}/library`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    logger.error('portal.error', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Erro ao abrir portal' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create analytics event route**

```typescript
// src/app/api/analytics/event/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { userScopedContainer } from '@/infrastructure/di/container';
import { createRateLimiter, clientIp } from '@/infrastructure/security/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
  sessionId: z.string().max(64).optional(),
});

const limiter = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = limiter.check(`analytics:${ip}`);
  if (!rate.allowed) return new NextResponse(null, { status: 429 });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 422 });
  }

  try {
    const c = await userScopedContainer();
    const { data: { user } } = await c.db.auth.getUser();

    await c.trackAnalyticsEvent.execute({
      userId: user?.id ?? null,
      event: body.event,
      properties: body.properties,
      sessionId: body.sessionId,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
```

---

### Task 7: Book Reader UI — Per-Page Access Control

**Files:**
- Modify: `src/app/books/[slug]/page.tsx`
- Create: `src/components/book/PremiumConversionScreen.tsx`
- Create: `src/components/book/PreviewBanner.tsx`
- Modify: `src/components/book/BookApp.tsx`

**Interfaces:**
- Consumes: `BookAccess.accessLevel`, `BookAccess.previewPageIndices` from updated `GetBookAccess`
- Produces: book reader with per-page gating; beautiful premium CTA screen

- [ ] **Step 1: Update /books/[slug]/page.tsx**

Replace the return value to pass accessLevel and previewPageIndices:

```typescript
// src/app/books/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { userScopedContainer, logger } from '@/infrastructure/di/container';
import { DomainError } from '@/core/domain/errors/domain-error';
import { getBookReader } from '@/components/book/book-registry';
import { ForbiddenScreen } from '@/components/book/forbidden-screen';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await userScopedContainer();

  const { data: { user } } = await c.db.auth.getUser();
  if (!user) redirect(`/login?next=/books/${encodeURIComponent(slug)}`);

  try {
    const { product, progress, accessLevel, previewPageIndices } =
      await c.getBookAccess.execute(user.id, slug);

    const Reader = getBookReader(product.slug);
    if (!Reader) {
      logger.error('book.reader_not_registered', { slug: product.slug });
      notFound();
    }

    logger.info('book.opened', { userId: user.id, productId: product.id, accessLevel });

    await c.db
      .rpc('log_book_access', { p_product_id: product.id })
      .then(({ error: rpcError }) => {
        if (rpcError) logger.warn('book.access_log_failed', { error: rpcError.message });
      });

    await c.trackAnalyticsEvent.execute({
      userId: user.id,
      event: 'book.opened',
      properties: { productId: product.id, accessLevel },
    });

    return (
      <Reader
        productId={product.id}
        initialProgress={
          progress
            ? {
                lastPage: progress.lastPage,
                visited: progress.visited,
                favorites: progress.favorites,
                completed: progress.completed,
              }
            : null
        }
        accessLevel={accessLevel}
        previewPageIndices={previewPageIndices}
      />
    );
  } catch (err) {
    if (err instanceof DomainError) {
      if (err.code === 'NOT_FOUND') notFound();
      if (err.code === 'FORBIDDEN') {
        logger.warn('book.access_denied', { userId: user.id, slug });
        return <ForbiddenScreen slug={slug} />;
      }
    }
    throw err;
  }
}
```

- [ ] **Step 2: Create PremiumConversionScreen component**

```tsx
// src/components/book/PremiumConversionScreen.tsx
'use client';

import { motion } from 'motion/react';
import { Lock, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props {
  productSlug: string;
  onDismiss?: () => void;
}

export function PremiumConversionScreen({ productSlug, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(24px)', background: 'rgba(19,19,19,0.92)' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(255,77,45,0.18) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280, delay: 0.05 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#FF4D2D]/25 bg-[#1a1a1a] p-8 text-center shadow-[0_0_80px_rgba(255,77,45,0.15)]"
      >
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.15 }}
          className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,77,45,0.2), rgba(255,77,45,0.08))',
            border: '1px solid rgba(255,77,45,0.3)',
          }}
        >
          <Lock className="h-7 w-7 text-[#FF4D2D]" />
        </motion.div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FF4D2D]">
          Conteúdo Premium
        </p>
        <h2 className="mt-3 font-display text-2xl font-black leading-tight text-white">
          Esta dinâmica não está no<br />
          <span className="text-[#FF4D2D]">modo preview</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Você está explorando as primeiras dinâmicas. Para acessar as 50 completas,
          assine ou compre o livro.
        </p>

        {/* Benefits */}
        <div className="mt-5 space-y-2 text-left">
          {[
            { icon: Star, text: '50 dinâmicas completas com passo a passo' },
            { icon: Zap, text: 'Cronômetro, favoritos e progresso sincronizado' },
            { icon: Sparkles, text: 'Acesso vitalício — uma vez, para sempre' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FF4D2D]/10">
                <Icon className="h-3.5 w-3.5 text-[#FF4D2D]" />
              </div>
              <span className="text-sm text-white/75">{text}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/${productSlug}#comprar`}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF4D2D, #ff7a5c)' }}
        >
          <Sparkles className="h-4 w-4" />
          Quero acesso completo
        </Link>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-3 w-full py-2 text-sm text-white/40 transition hover:text-white/70"
          >
            Voltar ao preview
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create PreviewBanner component**

```tsx
// src/components/book/PreviewBanner.tsx
'use client';

import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';

interface Props {
  productSlug: string;
  previewCount: number;
  totalCount: number;
}

export function PreviewBanner({ productSlug, previewCount, totalCount }: Props) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2 text-[11px] font-medium"
      style={{
        background: 'linear-gradient(90deg, rgba(255,77,45,0.12), rgba(255,77,45,0.06))',
        borderBottom: '1px solid rgba(255,77,45,0.2)',
      }}
    >
      <div className="flex items-center gap-2 text-[#ffb4a5]">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span>
          Modo preview — {previewCount} de {totalCount} dinâmicas disponíveis
        </span>
      </div>
      <Link
        href={`/${productSlug}#comprar`}
        className="flex shrink-0 items-center gap-1 rounded-full border border-[#FF4D2D]/40 bg-[#FF4D2D]/10 px-3 py-1 text-[#FF4D2D] transition hover:bg-[#FF4D2D]/20"
      >
        Desbloquear <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Update BookApp.tsx to add per-page access gating**

The `BookApp` component receives two new props and shows `PremiumConversionScreen` when navigating to a locked page, plus `PreviewBanner` in the header:

Add to `BookAppProps` interface:
```typescript
  accessLevel: 'full' | 'preview';
  previewPageIndices: number[];
```

Add state after existing state declarations:
```typescript
  const [showConversionScreen, setShowConversionScreen] = useState(false);
  const previewSet = useMemo(() => new Set(previewPageIndices), [previewPageIndices]);
  const isPreview = accessLevel === 'preview';
```

Modify the `go` function to check access:
```typescript
  const go = (dir: 1 | -1) => {
    setPage((p) => {
      const next = Math.min(Math.max(p + dir, 0), total - 1);
      if (next !== p) {
        setDirection(dir);
        // Block navigation to locked pages in preview mode
        if (isPreview && !previewSet.has(next)) {
          setTimeout(() => setShowConversionScreen(true), 0);
          return p; // don't navigate
        }
      }
      return next;
    });
  };
```

Add `<PreviewBanner>` just before the `<header>` content (inside the header div):
```tsx
{isPreview && (
  <PreviewBanner
    productSlug="50dinamicas"
    previewCount={previewPageIndices.length}
    totalCount={total}
  />
)}
```

Add `<AnimatePresence>` + `<PremiumConversionScreen>` at the end, before the closing `</div>`:
```tsx
<AnimatePresence>
  {showConversionScreen && (
    <PremiumConversionScreen
      productSlug="50dinamicas"
      onDismiss={() => setShowConversionScreen(false)}
    />
  )}
</AnimatePresence>
```

Add imports at top:
```tsx
import { PremiumConversionScreen } from './PremiumConversionScreen';
import { PreviewBanner } from './PreviewBanner';
```

Update the `BookSpread` / `BookApp` component signature at `src/components/book/book-registry.tsx` (or wherever `BookApp` is exported) to reflect the new props.

---

### Task 8: Library UI + Admin Pages

**Files:**
- Modify: `src/components/library/library-card.tsx`
- Create: `src/app/admin/pages/page.tsx`
- Create: `src/app/admin/subscriptions/page.tsx`

**Interfaces:**
- Consumes: `LibraryItem.accessType` from updated `GetUserLibrary`
- Produces: library cards with access badge; admin pages to manage previews + subscriptions

- [ ] **Step 1: Update LibraryCard to show access type badge**

In `src/components/library/library-card.tsx`, replace the mini cover strip section to show access type badge:

```tsx
// Replace the existing badge section:
{viaAdmin ? (
  <span className="absolute right-3 top-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--gold-foreground)]">
    Admin
  </span>
) : null}

// With:
<AccessTypeBadge type={item.accessType} />
```

Add the `AccessTypeBadge` helper at the bottom of the file:
```tsx
function AccessTypeBadge({ type }: { type: 'premium' | 'preview' | 'admin' }) {
  const configs = {
    premium: {
      label: 'Premium',
      style: { background: 'linear-gradient(135deg, #FF4D2D, #ff7a5c)' },
    },
    preview: {
      label: 'Preview',
      style: { background: 'rgba(255,77,45,0.15)', color: '#FF4D2D', border: '1px solid rgba(255,77,45,0.3)' },
    },
    admin: {
      label: 'Admin',
      style: { background: 'var(--gold)', color: 'var(--gold-foreground)' },
    },
  };
  const c = configs[type];
  return (
    <span
      className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
      style={c.style}
    >
      {c.label}
    </span>
  );
}
```

Also update the "Abrir"/"Continuar" button to show different text for preview:
```tsx
<Link href={`/books/${product.slug}`} className="...">
  <BookOpen className="h-4 w-4" />
  {item.accessType === 'preview'
    ? 'Explorar Preview'
    : started
    ? 'Continuar Leitura'
    : 'Abrir'}
</Link>
```

For preview items, also show a small upgrade CTA below the button:
```tsx
{item.accessType === 'preview' && (
  <Link
    href="/50dinamicas#comprar"
    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#FF4D2D]/30 py-2 text-[11px] font-medium text-[#FF4D2D] transition hover:bg-[#FF4D2D]/10"
  >
    <Sparkles className="h-3 w-3" /> Desbloquear acesso completo
  </Link>
)}
```

Add `Sparkles` to imports: `import { BookOpen, Clock, Sparkles } from 'lucide-react';`

- [ ] **Step 2: Create admin book-pages management page**

```tsx
// src/app/admin/pages/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient } from '@/infrastructure/supabase/server';
import { createSupabaseServerClient } from '@/infrastructure/supabase/server';
import { SupabaseProfileRepository } from '@/infrastructure/repositories/supabase-profile-repository';
import { SupabaseBookPageRepository } from '@/infrastructure/repositories/supabase-book-page-repository';
import { SupabaseProductRepository } from '@/infrastructure/repositories/supabase-product-repository';
import { BookPagesAdminForm } from './book-pages-admin-form';

export const metadata: Metadata = { title: 'Admin — Páginas do Livro' };
export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const profiles = new SupabaseProfileRepository(db);
  const profile = await profiles.findById(user.id);
  if (!profile?.isAdmin) redirect('/library');

  const admin = createSupabaseAdminClient();
  const products = new SupabaseProductRepository(admin);
  const bookPageRepo = new SupabaseBookPageRepository(admin);

  const allProducts = await products.listActive();
  const product = allProducts[0]; // 50dinamicas
  if (!product) return <p className="p-8 text-white">Nenhum produto encontrado.</p>;

  const pages = await bookPageRepo.findByProduct(product.id);

  // Fill missing pages (0-49) with defaults
  const pagesMap = new Map(pages.map((p) => [p.pageIndex, p]));
  const allPages = Array.from({ length: 50 }, (_, i) => ({
    pageIndex: i,
    previewEnabled: pagesMap.get(i)?.previewEnabled ?? false,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Páginas do Livro — {product.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Marque as páginas visíveis no modo preview (convites de demonstração).
      </p>
      <BookPagesAdminForm productId={product.id} pages={allPages} />
    </div>
  );
}
```

Create the client form component:

```tsx
// src/app/admin/pages/book-pages-admin-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { togglePreviewPage } from './actions';

interface PageRow { pageIndex: number; previewEnabled: boolean; }

export function BookPagesAdminForm({
  productId,
  pages,
}: {
  productId: string;
  pages: PageRow[];
}) {
  const [state, setState] = useState<Map<number, boolean>>(
    new Map(pages.map((p) => [p.pageIndex, p.previewEnabled])),
  );
  const [isPending, startTransition] = useTransition();

  function toggle(pageIndex: number) {
    const next = !state.get(pageIndex);
    setState((prev) => new Map(prev).set(pageIndex, next));
    startTransition(() => togglePreviewPage(productId, pageIndex, next));
  }

  return (
    <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
      {pages.map(({ pageIndex }) => {
        const enabled = state.get(pageIndex) ?? false;
        return (
          <button
            key={pageIndex}
            onClick={() => toggle(pageIndex)}
            disabled={isPending}
            title={`Dinâmica ${pageIndex + 1} — ${enabled ? 'Preview ON' : 'Bloqueada'}`}
            className="flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition"
            style={
              enabled
                ? { borderColor: '#FF4D2D', background: 'rgba(255,77,45,0.12)', color: '#FF4D2D' }
                : { borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--muted-foreground)' }
            }
          >
            <span className="text-[11px] font-bold">{pageIndex + 1}</span>
            <span className="text-[9px] uppercase tracking-wide">
              {enabled ? 'Preview' : 'Locked'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

Create the server action:

```typescript
// src/app/admin/pages/actions.ts
'use server';

import { createSupabaseAdminClient } from '@/infrastructure/supabase/server';
import { SupabaseBookPageRepository } from '@/infrastructure/repositories/supabase-book-page-repository';

export async function togglePreviewPage(
  productId: string,
  pageIndex: number,
  previewEnabled: boolean,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const repo = new SupabaseBookPageRepository(admin);
  await repo.upsert(productId, pageIndex, previewEnabled);
}
```

- [ ] **Step 3: Create admin subscriptions page**

```tsx
// src/app/admin/subscriptions/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient } from '@/infrastructure/supabase/server';
import { createSupabaseServerClient } from '@/infrastructure/supabase/server';
import { SupabaseProfileRepository } from '@/infrastructure/repositories/supabase-profile-repository';
import { SupabaseSubscriptionRepository } from '@/infrastructure/repositories/supabase-subscription-repository';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Assinaturas' };
export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const profiles = new SupabaseProfileRepository(db);
  const profile = await profiles.findById(user.id);
  if (!profile?.isAdmin) redirect('/library');

  const admin = createSupabaseAdminClient();
  const subscriptionRepo = new SupabaseSubscriptionRepository(admin);
  const subs = await subscriptionRepo.listAll(200);

  const active = subs.filter((s) => s.status === 'active' || s.status === 'trialing').length;
  const canceled = subs.filter((s) => s.status === 'canceled').length;
  const pastDue = subs.filter((s) => s.status === 'past_due').length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Assinaturas</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Ativas', value: active, color: '#22c55e' },
          { label: 'Canceladas', value: canceled, color: '#a1a1aa' },
          { label: 'Em atraso', value: pastDue, color: '#FF4D2D' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-black" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-3">Stripe Subscription</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Próx. cobrança</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {s.stripeSubscriptionId.slice(0, 20)}…
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.currentPeriodStart ? formatDate(s.currentPeriodStart) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : '—'}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma assinatura ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#22c55e',
    trialing: '#3b82f6',
    past_due: '#f59e0b',
    canceled: '#a1a1aa',
    unpaid: '#ef4444',
    paused: '#8b5cf6',
    incomplete: '#f59e0b',
  };
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ background: colors[status] ?? '#a1a1aa' }}
    >
      {status}
    </span>
  );
}
```

---

### Task 9: Admin Navigation Update

**Files:**
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Produces: links to new admin sections (pages, subscriptions)

- [ ] **Step 1: Add new admin sections to admin dashboard**

Read `src/app/admin/page.tsx` and add cards for "Páginas" and "Assinaturas":

```tsx
// Add to the existing admin cards grid:
<AdminCard href="/admin/pages" label="Páginas" description="Controle preview por página" emoji="📄" />
<AdminCard href="/admin/subscriptions" label="Assinaturas" description="Assinantes ativos e cancelados" emoji="🔄" />
```

---

## Self-Review: Spec Coverage Check

| Spec Requirement | Task Covering It |
|---|---|
| Per-page `preview_enabled` boolean | Task 1: `book_pages.preview_enabled` |
| `book_pages` table | Task 1 migration |
| `subscriptions` table | Task 1 migration |
| `invite_links` access_type | Task 1: `invites.access_type` column |
| `preview_access` table | Task 1 migration |
| Stripe Billing (recurring) | Task 3: gateway + Task 4: use case |
| Stripe Customer Portal | Task 3: gateway + Task 6: API route |
| 8 webhook handlers | Task 6: extended webhook route |
| Beautiful premium conversion screen | Task 7: `PremiumConversionScreen.tsx` |
| Preview banner in reader header | Task 7: `PreviewBanner.tsx` |
| Access type indicator in reader | Task 7: BookApp props |
| Visual library differentiation | Task 8: `AccessTypeBadge` in LibraryCard |
| Admin panel for pages | Task 8: `/admin/pages/page.tsx` |
| Admin panel for subscriptions | Task 8: `/admin/subscriptions/page.tsx` |
| Analytics events | Tasks 2+4+6: events system |
| Server-only validation | All API routes validate server-side |
| RLS policies | Task 1: all new tables have RLS |
| Rate limiting | Tasks 6: all API routes use limiter |
| Stripe signature validation | Task 6: webhook uses `constructEvent` |
| Invite access_type ('preview') | Task 5: updated `convite/actions.ts` |

## Production Checklist

- [ ] Apply all 4 migrations to Supabase prod
- [ ] Create subscription product in Stripe live dashboard with `type: 'subscription'`
- [ ] Update the product `stripe_price_id` in DB to the recurring price ID
- [ ] Add webhook endpoints in Stripe: `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`, `customer.subscription.paused/resumed/trial_will_end`
- [ ] Configure Stripe Customer Portal in dashboard (branding, allowed features)
- [ ] Test end-to-end: preview invite → see 5 pages → hit locked page → conversion screen → buy → full access
- [ ] Verify RLS: a user cannot read another user's subscriptions/preview_access
