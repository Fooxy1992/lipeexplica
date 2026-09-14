import { NextResponse } from 'next/server';
import { adminContainer, logger } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log = logger.child({ scope: 'cron.raffle-cleanup' });
  const c = adminContainer();

  await c.releaseExpiredReservations.execute();
  log.info('cron.cleanup_done');
  return NextResponse.json({ ok: true });
}
