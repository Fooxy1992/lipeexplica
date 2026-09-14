import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminContainer, logger } from '@/infrastructure/di/container';
import { DomainError, httpStatusFor } from '@/core/domain/errors/domain-error';
import { publicEnv } from '@/lib/env';

export const runtime = 'nodejs';

const schema = z.object({
  raffle_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(200),
  buyer_name: z.string().min(1).max(200),
  buyer_email: z.string().email(),
  buyer_phone: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const log = logger.child({ scope: 'raffle.checkout' });
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 });
    }

    const { raffle_id, quantity, buyer_name, buyer_email, buyer_phone } = parsed.data;
    // adminContainer: a RPC de reserva requer service_role
    const c = adminContainer();
    const result = await c.purchaseRaffleTickets.execute({
      raffleId: raffle_id,
      quantity,
      buyerName: buyer_name,
      buyerEmail: buyer_email,
      buyerPhone: buyer_phone ?? null,
      siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
    });

    return NextResponse.json({ session_url: result.sessionUrl });
  } catch (err) {
    if (err instanceof DomainError) {
      log.warn('raffle.checkout_error', { code: err.code, message: err.message });
      return NextResponse.json({ error: err.message }, { status: httpStatusFor[err.code] });
    }
    log.error('raffle.checkout_unexpected', { error: String(err) });
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
