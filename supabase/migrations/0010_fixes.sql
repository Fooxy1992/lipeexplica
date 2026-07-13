-- Fix 1: Add 'incomplete_expired' to subscriptions.status CHECK constraint
-- Stripe sends this when a subscription's initial payment window closes without payment
alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active','canceled','past_due','unpaid','incomplete','trialing','paused','incomplete_expired'));

-- Fix 2: Allow authenticated users to INSERT into analytics_events
-- Missing INSERT policy caused the book reader to 500 for every user
create policy "analytics: authenticated users can insert"
  on public.analytics_events
  for insert
  with check (auth.uid() is not null);
