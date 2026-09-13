-- The "book + WhatsApp group" bundle was a one-time R$19,90 that promised new
-- dinâmicas forever. That promise is now a monthly subscription instead, so the
-- product needs a display price for the recurring plan, and the bundle columns
-- are retired.
--
-- Nothing is dropped and no existing purchase is touched: the 10 buyers who
-- already paid keep lifetime access. Only new checkouts change.

alter table public.products
  add column if not exists subscription_price integer;

comment on column public.products.subscription_price is
  'Display price per month in cents for subscription_stripe_price_id. Stripe stays the source of truth for what is charged.';

comment on column public.products.stripe_bundle_price_id is
  'RETIRED 2026-09-13: the bundle became a monthly subscription. Kept for history.';

comment on column public.products.bundle_price is
  'RETIRED 2026-09-13: see stripe_bundle_price_id.';

update public.products
set subscription_price = 1490,
    stripe_bundle_price_id = null,
    bundle_price = null
where slug = 'dinamicas-jiu-jitsu-infantil';
