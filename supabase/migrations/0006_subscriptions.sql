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
