-- =============================================================================
-- Seed: first product — "50 Dinâmicas para Jiu-Jitsu Infantil"
-- NOTE: replace stripe_price_id with the real Price ID created in the Stripe
-- Dashboard (see docs/SETUP_STRIPE.md). Price here is display-only (cents).
-- =============================================================================

insert into public.products (title, slug, description, cover, type, price, currency, stripe_price_id, active)
values (
  '50 Dinâmicas para Jiu-Jitsu Infantil',
  'dinamicas-jiu-jitsu-infantil',
  'Livro interativo com 50 dinâmicas práticas para professores de Jiu-Jitsu infantil. Organizadas por categoria, com objetivos claros, idade recomendada, materiais e passo a passo — para transformar suas aulas em experiências inesquecíveis.',
  '/covers/dinamicas-jiu-jitsu-infantil.png',
  'ebook',
  4700,
  'brl',
  'price_REPLACE_ME',
  true
)
on conflict (slug) do nothing;
