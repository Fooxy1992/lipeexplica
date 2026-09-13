-- =============================================================================
-- Produto: O Mental do Tatame
-- Slug: mental-do-tatame
-- Stripe product: prod_VFryPK3Uz6b3FB
-- Planos: Essencial R$14,90/mês · Completo R$24,90/mês
-- =============================================================================

insert into public.products (
  title,
  slug,
  description,
  cover,
  type,
  price,
  currency,
  stripe_price_id,
  active
)
values (
  'O Mental do Tatame',
  'mental-do-tatame',
  '50 situações reais de mentalidade no jiu-jitsu. Ansiedade, ego, frustração, constância, competição e evolução — com a realidade por trás de cada pensamento e o que fazer.',
  '/mental-cover.webp',
  'ebook',
  1490,
  'brl',
  'price_1UFMFQIKxVpgCsVIGu4D3U9a',
  true
)
on conflict (slug) do nothing;

insert into public.product_plans
  (product_id, slug, name, description, stripe_price_id, price, features, highlight, sort_order)
select
  p.id,
  'essencial',
  'Essencial',
  'As 50 situações completas, sempre à mão.',
  'price_1UFMFQIKxVpgCsVIGu4D3U9a',
  1490,
  array[
    'As 50 situações completas',
    'Busca, favoritos e progresso',
    'Filtre por categoria',
    'Cancele quando quiser'
  ],
  false,
  1
from public.products p
where p.slug = 'mental-do-tatame'
on conflict (product_id, slug) do nothing;

insert into public.product_plans
  (product_id, slug, name, description, stripe_price_id, price, features, highlight, sort_order)
select
  p.id,
  'completo',
  'Completo',
  'A biblioteca cresce todo mês.',
  'price_1UFMFQIKxVpgCsVI8SmRn8T2',
  2490,
  array[
    'Tudo do Essencial',
    'Novos conteúdos todo mês',
    'Acesso a tudo que for publicado',
    'Cancele quando quiser'
  ],
  true,
  2
from public.products p
where p.slug = 'mental-do-tatame'
on conflict (product_id, slug) do nothing;
