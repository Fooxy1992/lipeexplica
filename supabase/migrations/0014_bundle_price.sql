alter table public.products
  add column if not exists stripe_bundle_price_id text,
  add column if not exists bundle_price integer;
