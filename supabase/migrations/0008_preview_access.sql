-- supabase/migrations/0008_preview_access.sql
-- Tracks users who redeemed a "preview" invite (partial access).
-- Add access_type column to invites first.
alter table public.invites
  add column if not exists access_type text not null default 'full'
  check (access_type in ('full', 'preview'));

-- Preview access grants: one row per user x product
create table public.preview_access (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  product_id uuid        not null references public.products(id) on delete cascade,
  invite_id  uuid        references public.invites(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index idx_preview_access_user    on public.preview_access(user_id);
create index idx_preview_access_product on public.preview_access(product_id);

alter table public.preview_access enable row level security;

create policy "preview_access: read own or admin"
  on public.preview_access for select
  using (user_id = auth.uid() or public.is_admin());
