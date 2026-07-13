-- Separate one-time and subscription price IDs on products
-- The existing stripe_price_id column remains for one-time purchases.
alter table public.products
  add column if not exists subscription_stripe_price_id text;

-- Wire the recurring price (R$14,90/month) for the existing book
update public.products
  set subscription_stripe_price_id = 'price_1Tss51IKxVpgCsVI2ew84NYD'
  where slug = 'dinamicas-jiu-jitsu-infantil';
