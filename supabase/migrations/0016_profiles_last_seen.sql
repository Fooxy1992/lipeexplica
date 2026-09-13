-- -----------------------------------------------------------------------------
-- LAST SEEN — real activity signal for the admin panel.
--
-- auth.users.last_sign_in_at is only written by GoTrue on a *fresh* sign-in
-- (password, OTP verify, OAuth). Refresh-token rotation never touches it, so a
-- user who logged in once and keeps browsing daily looks frozen at that date.
-- profiles.last_seen_at is refreshed by the middleware (throttled) while the
-- user has a live session.
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

comment on column public.profiles.last_seen_at is
  'Last request served with a valid session. Written by middleware, throttled (~15min).';

create index if not exists idx_profiles_last_seen_at
  on public.profiles (last_seen_at desc nulls last);

-- Backfill with the best signal we already have: the newest reading access.
update public.profiles p
set last_seen_at = rp.last_accessed_at
from (
  select user_id, max(last_accessed_at) as last_accessed_at
  from public.reading_progress
  group by user_id
) rp
where rp.user_id = p.id
  and p.last_seen_at is null;
