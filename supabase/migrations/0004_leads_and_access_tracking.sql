-- (aplicada via MCP em 2026-07-12 — mantida aqui para versionamento)
-- LEADS + contagem de acessos ao livro. Ver dashboard para estado atual.

create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  phone      text,
  source     text not null default 'newsletter'
             check (source in ('newsletter', 'contato', 'checkout', 'outro')),
  message    text,
  created_at timestamptz not null default now()
);

create index idx_leads_source     on public.leads (source);
create index idx_leads_created_at on public.leads (created_at desc);
create unique index idx_leads_email_source on public.leads (lower(email), source);

alter table public.leads enable row level security;

create policy "leads: admin read"
  on public.leads for select using (public.is_admin());
create policy "leads: admin delete"
  on public.leads for delete using (public.is_admin());

alter table public.reading_progress
  add column if not exists open_count integer not null default 0;

create or replace function public.log_book_access(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_access(p_product_id) then
    return;
  end if;
  insert into public.reading_progress (user_id, product_id, open_count, last_accessed_at)
  values (auth.uid(), p_product_id, 1, now())
  on conflict (user_id, product_id)
  do update set
    open_count = public.reading_progress.open_count + 1,
    last_accessed_at = now();
end;
$$;
