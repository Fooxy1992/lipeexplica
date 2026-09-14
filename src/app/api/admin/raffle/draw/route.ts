import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminContainer, logger } from '@/infrastructure/di/container';
import { DomainError, httpStatusFor } from '@/core/domain/errors/domain-error';
import { createSupabaseServerClient } from '@/infrastructure/supabase/server';

export const runtime = 'nodejs';

const schema = z.object({ raffle_id: z.string().uuid() });

export async function POST(request: Request) {
  const log = logger.child({ scope: 'admin.raffle.draw' });

  // Verify admin session via cookies
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const c = adminContainer();
  const profile = await c.profiles.findById(user.id);
  if (!profile?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 });

  try {
    const result = await c.drawRaffleWinner.execute(parsed.data.raffle_id);
    log.info('admin.raffle.drawn', { raffleId: parsed.data.raffle_id, winner: result.winnerTicketNumber });
    return NextResponse.json({ winner_ticket_number: result.winnerTicketNumber });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.message }, { status: httpStatusFor[err.code] });
    }
    log.error('admin.raffle.draw_failed', { error: String(err) });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
