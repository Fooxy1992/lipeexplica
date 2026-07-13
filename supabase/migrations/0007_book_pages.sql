-- supabase/migrations/0007_book_pages.sql
-- Per-page content metadata. preview_enabled = true → visible to preview users.
create table public.book_pages (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references public.products(id) on delete cascade,
  page_index      integer     not null check (page_index >= 0),
  preview_enabled boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(product_id, page_index)
);

create index idx_book_pages_product on public.book_pages(product_id);

create trigger trg_book_pages_updated_at before update on public.book_pages
  for each row execute function public.set_updated_at();

alter table public.book_pages enable row level security;

-- Authenticated users can read (need to check preview_enabled for access logic)
create policy "book_pages: read authenticated"
  on public.book_pages for select
  using (auth.uid() is not null);

create policy "book_pages: admin write"
  on public.book_pages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed first 5 pages (0-4) as preview for "50dinamicas" product
-- Run after product exists in DB. Uses DO block so it's idempotent.
do $$
declare
  v_product_id uuid;
begin
  select id into v_product_id from public.products where slug = 'dinamicas-jiu-jitsu-infantil' limit 1;
  if v_product_id is not null then
    insert into public.book_pages (product_id, page_index, preview_enabled)
    select v_product_id, s.n, (s.n < 5)
    from generate_series(0, 49) as s(n)
    on conflict (product_id, page_index) do nothing;
  end if;
end;
$$;
