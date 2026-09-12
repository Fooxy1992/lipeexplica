-- (aplicada via MCP em 2026-07-12 — mantida para versionamento)
-- Convites: acesso a produto para quem pagou fora do Stripe (Pix, dinheiro).
create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_by  uuid references auth.users (id) on delete set null,
  note        text,
  max_uses    integer not null default 1 check (max_uses >= 1),
  used_count  integer not null default 0,
  active      boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_invites_token on public.invites (token);

alter table public.invites enable row level security;

create policy "invites: admin read"
  on public.invites for select using (public.is_admin());
create policy "invites: admin write"
  on public.invites for all using (public.is_admin()) with check (public.is_admin());
