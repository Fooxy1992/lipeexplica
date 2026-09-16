import { NextResponse } from 'next/server';
import { adminContainer } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = adminContainer();
  const raffle = await c.raffleRepo.findById(id);
  if (!raffle) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 });

  const paid = await c.raffleTickets.countByStatus(id, 'paid');
  const available = await c.raffleTickets.countAvailable(id);
  // reserved = total minus paid minus truly-available (excludes expired reservations)
  const reserved = raffle.totalTickets - paid - available;

  return NextResponse.json({
    status: raffle.status,
    total_tickets: raffle.totalTickets,
    paid_tickets: paid,
    reserved_tickets: Math.max(0, reserved),
    available_tickets: available,
    draw_date: raffle.drawDate,
    winner_ticket_id: raffle.winnerTicketId,
  });
}
