-- =============================================================================
-- Rifa — Kimono Completo
-- =============================================================================

-- ─── raffles ─────────────────────────────────────────────────────────────────
create table public.raffles (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  prize_name        text        not null,
  prize_image_url   text,
  total_tickets     int         not null default 200,
  status            text        not null default 'active'
                    check (status in ('active', 'sold_out', 'drawing', 'completed')),
  draw_date         timestamptz,
  winner_ticket_id  uuid,
  created_at        timestamptz not null default now()
);

-- ─── raffle_tickets ──────────────────────────────────────────────────────────
create table public.raffle_tickets (
  id              uuid        primary key default gen_random_uuid(),
  raffle_id       uuid        not null references public.raffles (id) on delete cascade,
  ticket_number   int         not null,
  status          text        not null default 'available'
                  check (status in ('available', 'reserved', 'paid')),
  reserved_until  timestamptz,
  purchase_id     uuid,
  created_at      timestamptz not null default now(),
  unique (raffle_id, ticket_number)
);

create index idx_raffle_tickets_raffle_status on public.raffle_tickets (raffle_id, status);
create index idx_raffle_tickets_reserved_until on public.raffle_tickets (reserved_until)
  where status = 'reserved';

-- ─── raffle_purchases ────────────────────────────────────────────────────────
create table public.raffle_purchases (
  id                  uuid        primary key default gen_random_uuid(),
  raffle_id           uuid        not null references public.raffles (id) on delete cascade,
  stripe_session_id   text        unique,
  ticket_quantity     int         not null check (ticket_quantity >= 1),
  amount_cents        int         not null check (amount_cents > 0),
  status              text        not null default 'pending'
                      check (status in ('pending', 'paid', 'failed', 'expired')),
  buyer_name          text        not null,
  buyer_email         text        not null,
  buyer_phone         text,
  confirmation_token  text        unique default encode(gen_random_bytes(16), 'hex'),
  created_at          timestamptz not null default now()
);

create index idx_raffle_purchases_raffle_status on public.raffle_purchases (raffle_id, status);
create index idx_raffle_purchases_session on public.raffle_purchases (stripe_session_id);
create index idx_raffle_purchases_token on public.raffle_purchases (confirmation_token);

-- FK: raffle_tickets.purchase_id → raffle_purchases.id
alter table public.raffle_tickets
  add constraint fk_raffle_tickets_purchase
  foreign key (purchase_id) references public.raffle_purchases (id) on delete set null;

-- FK: raffles.winner_ticket_id → raffle_tickets.id
alter table public.raffles
  add constraint fk_raffles_winner_ticket
  foreign key (winner_ticket_id) references public.raffle_tickets (id) on delete set null;

-- ─── RPC: reserva atômica ────────────────────────────────────────────────────
create or replace function public.reserve_raffle_tickets(
  p_raffle_id   uuid,
  p_quantity    int,
  p_purchase_id uuid
) returns table(id uuid, ticket_number int) as $$
declare
  v_available int;
begin
  select count(*) into v_available
  from public.raffle_tickets
  where raffle_id = p_raffle_id
    and (
      status = 'available'
      or (status = 'reserved' and reserved_until < now())
    );

  if v_available < p_quantity then
    raise exception 'INSUFFICIENT_TICKETS: % disponíveis, solicitado %', v_available, p_quantity;
  end if;

  return query
  update public.raffle_tickets t
  set
    status         = 'reserved',
    reserved_until = now() + interval '30 minutes',
    purchase_id    = p_purchase_id
  where t.id in (
    select inner_t.id
    from public.raffle_tickets inner_t
    where inner_t.raffle_id = p_raffle_id
      and (
        inner_t.status = 'available'
        or (inner_t.status = 'reserved' and inner_t.reserved_until < now())
      )
    order by random()
    limit p_quantity
    for update skip locked
  )
  returning t.id, t.ticket_number;
end;
$$ language plpgsql security definer;

-- Só service_role pode chamar esta RPC
revoke execute on function public.reserve_raffle_tickets(uuid, int, uuid) from public, anon, authenticated;
grant  execute on function public.reserve_raffle_tickets(uuid, int, uuid) to service_role;
