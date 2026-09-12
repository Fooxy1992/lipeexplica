-- =============================================================================
-- LipeExplica Platform — Initial Schema
-- Multi-product digital sales platform (ebooks, courses, bundles, subscriptions)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES — 1:1 with auth.users, auto-created via trigger
-- -----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  avatar     text,
  phone      text,
  is_admin   boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data, 1:1 with auth.users.';

-- -----------------------------------------------------------------------------
-- PRODUCTS — catalog. Multi-product by design (ebook, course, bundle, ...)
-- -----------------------------------------------------------------------------
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  title           text        not null,
  slug            text        not null unique,
  description     text,
  cover           text,
  type            text        not null default 'ebook'
                  check (type in ('ebook', 'course', 'bundle', 'subscription', 'community')),
  price           integer     not null check (price >= 0), -- in cents, source of truth is Stripe Price
  currency        text        not null default 'brl',
  stripe_price_id text,
  active          boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.products.price is 'Display price in cents. Checkout ALWAYS uses stripe_price_id — never this value.';

create index idx_products_active on public.products (active);
create index idx_products_type   on public.products (type);

-- -----------------------------------------------------------------------------
-- PURCHASES — one row per paid Stripe Checkout Session
-- -----------------------------------------------------------------------------
create table public.purchases (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid        not null references auth.users (id) on delete cascade,
  product_id            uuid        not null references public.products (id) on delete restrict,
  stripe_payment_intent text unique,
  stripe_session_id     text        not null unique,
  amount                integer     not null,
  currency              text        not null default 'brl',
  status                text        not null default 'paid'
                        check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at            timestamptz not null default now()
);

create index idx_purchases_user_id    on public.purchases (user_id);
create index idx_purchases_product_id on public.purchases (product_id);
create index idx_purchases_status     on public.purchases (status);
create index idx_purchases_user_status on public.purchases (user_id, status);

-- -----------------------------------------------------------------------------
-- READING_PROGRESS — per user × product (drives "Continuar Leitura" in /library)
-- -----------------------------------------------------------------------------
create table public.reading_progress (
  user_id          uuid        not null references auth.users (id) on delete cascade,
  product_id       uuid        not null references public.products (id) on delete cascade,
  last_page        integer     not null default 0,
  total_pages      integer     not null default 0,
  visited          integer[]   not null default '{}',
  favorites        integer[]   not null default '{}',
  completed        boolean     not null default false,
  last_accessed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index idx_reading_progress_user on public.reading_progress (user_id);

-- -----------------------------------------------------------------------------
-- WEBHOOK_EVENTS — Stripe webhook idempotency ledger
-- -----------------------------------------------------------------------------
create table public.webhook_events (
  id           text primary key, -- Stripe event id (evt_...)
  type         text        not null,
  payload      jsonb,
  processed_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create profile when a user signs up (magic link, Google, Apple, webhook)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Helpers used by RLS policies
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.has_access(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.purchases
    where user_id = auth.uid()
      and product_id = p_product_id
      and status = 'paid'
  );
$$;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Service role (webhook / server) bypasses RLS. Policies below apply to
-- anon + authenticated only.
-- -----------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.purchases        enable row level security;
alter table public.reading_progress enable row level security;
alter table public.webhook_events   enable row level security; -- no policies: service role only

-- profiles
create policy "profiles: read own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- products (public catalog: only active products are visible; admin sees all)
create policy "products: read active"
  on public.products for select
  using (active = true or public.is_admin());

create policy "products: admin write"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- purchases (created only by service role via Stripe webhook)
create policy "purchases: read own or admin"
  on public.purchases for select
  using (user_id = auth.uid() or public.is_admin());

create policy "purchases: admin update"
  on public.purchases for update
  using (public.is_admin())
  with check (public.is_admin());

-- reading_progress (only for products the user actually owns)
create policy "progress: read own"
  on public.reading_progress for select
  using (user_id = auth.uid());

create policy "progress: insert own if purchased"
  on public.reading_progress for insert
  with check (user_id = auth.uid() and public.has_access(product_id));

create policy "progress: update own"
  on public.reading_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
