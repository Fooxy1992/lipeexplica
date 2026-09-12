-- Update product prices: R$159,90 → R$14,90, bundle R$189,90 → R$19,90
-- New Stripe prices created 2026-07-15 (livemode)
update public.products
set
  price              = 1490,
  stripe_price_id    = 'price_1TtQ72IKxVpgCsVIeOVdPd6w',
  bundle_price       = 1990,
  stripe_bundle_price_id = 'price_1TtQ74IKxVpgCsVIrWD8VgUU'
where slug = 'dinamicas-jiu-jitsu-infantil';
