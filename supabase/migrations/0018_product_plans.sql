-- Packaging has changed three times now (one-time, one-time + bundle, and now
-- two monthly tiers), and each change added columns to products that the next
-- change orphaned. Plans get their own table so the fourth change is a row.
--
-- One-time sales are over: both plans are monthly. Nobody who already bought
-- loses anything — GetUserLibrary grants access on a paid purchase OR an active
-- subscription, so the 10 existing buyers keep lifetime access through their
-- purchase rows.

create table if not exists public.product_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  stripe_price_id text not null,
  -- Display price in cents. Stripe stays the source of truth for the charge.
  price integer not null,
  currency text not null default 'brl',
  billing_interval text not null default 'month'
    check (billing_interval in ('month', 'year')),
  features text[] not null default '{}',
  highlight boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, slug)
);

create index if not exists idx_product_plans_product
  on public.product_plans (product_id, sort_order);

alter table public.product_plans enable row level security;

-- Same shape as products: the catalogue is public, writes are admin-only.
drop policy if exists "product_plans: read active" on public.product_plans;
create policy "product_plans: read active"
  on public.product_plans for select
  using (active = true or public.is_admin());

drop policy if exists "product_plans: admin write" on public.product_plans;
create policy "product_plans: admin write"
  on public.product_plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- The two live plans. Essencial is the recurring price that already existed in
-- Stripe and had never been sold; Completo was created alongside this change.
insert into public.product_plans
  (product_id, slug, name, description, stripe_price_id, price, features, highlight, sort_order)
select
  p.id,
  'essencial',
  'Essencial',
  'As 50 dinâmicas completas, sempre à mão.',
  'price_1Tss51IKxVpgCsVI2ew84NYD',
  1490,
  array[
    'As 50 dinâmicas completas',
    'Busca, favoritos e progresso',
    'Correções e melhorias do livro',
    'Cancele quando quiser'
  ],
  false,
  1
from public.products p
where p.slug = 'dinamicas-jiu-jitsu-infantil'
on conflict (product_id, slug) do nothing;

insert into public.product_plans
  (product_id, slug, name, description, stripe_price_id, price, features, highlight, sort_order)
select
  p.id,
  'completo',
  'Completo',
  'A biblioteca cresce todo mês.',
  'price_1UFE10IKxVpgCsVIHaihiLke',
  2490,
  array[
    'Tudo do Essencial',
    'Dinâmicas novas todo mês',
    'Acesso a tudo que for publicado',
    'Cancele quando quiser'
  ],
  true,
  2
from public.products p
where p.slug = 'dinamicas-jiu-jitsu-infantil'
on conflict (product_id, slug) do nothing;

-- Superseded by product_plans; kept only so old rows stay readable.
comment on column public.products.subscription_stripe_price_id is
  'RETIRED 2026-09-13: superseded by product_plans.stripe_price_id.';
comment on column public.products.subscription_price is
  'RETIRED 2026-09-13: superseded by product_plans.price.';
