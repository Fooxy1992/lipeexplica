-- supabase/migrations/0009_analytics_events.sql
-- Lightweight in-product analytics (no external service needed for MVP).
create table public.analytics_events (
  id         bigserial   primary key,
  user_id    uuid        references auth.users(id) on delete set null,
  event      text        not null,
  properties jsonb       not null default '{}',
  session_id text,
  created_at timestamptz not null default now()
);

create index idx_analytics_events_user  on public.analytics_events(user_id);
create index idx_analytics_events_event on public.analytics_events(event);
create index idx_analytics_events_time  on public.analytics_events(created_at);

alter table public.analytics_events enable row level security;

-- Admin reads all; users cannot read (write-only from server)
create policy "analytics: admin read"
  on public.analytics_events for select
  using (public.is_admin());
