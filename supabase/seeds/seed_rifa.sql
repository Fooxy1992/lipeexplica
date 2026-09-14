-- Run ONCE after applying migration 0020_rifa.sql
-- Creates the active raffle and 200 available tickets

DO $$
DECLARE
  v_raffle_id uuid := gen_random_uuid();
  i int;
BEGIN
  INSERT INTO raffles (id, title, prize_name, prize_image_url, total_tickets, status)
  VALUES (
    v_raffle_id,
    'Rifa do Kimono Completo',
    'Kimono Completo (R$400–600)',
    NULL,
    200,
    'active'
  );

  FOR i IN 1..200 LOOP
    INSERT INTO raffle_tickets (raffle_id, ticket_number, status)
    VALUES (v_raffle_id, i, 'available');
  END LOOP;

  RAISE NOTICE 'Raffle created: %', v_raffle_id;
END;
$$;
