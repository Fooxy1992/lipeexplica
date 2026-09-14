import { NextResponse } from 'next/server';
import { adminContainer, logger } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log = logger.child({ scope: 'cron.raffle-draw' });
  const c = adminContainer();

  const rafflesDue = await c.raffleRepo.listDueForDraw();
  log.info('cron.raffle_draw_start', { count: rafflesDue.length });

  const results: Array<{ raffleId: string; ticketNumber?: number; error?: string }> = [];

  for (const raffle of rafflesDue) {
    try {
      const result = await c.drawRaffleWinner.execute(raffle.id);
      log.info('cron.raffle_drawn', { raffleId: raffle.id, winner: result.winnerTicketNumber });
      results.push({ raffleId: raffle.id, ticketNumber: result.winnerTicketNumber });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error('cron.raffle_draw_failed', { raffleId: raffle.id, error: message });
      results.push({ raffleId: raffle.id, error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
