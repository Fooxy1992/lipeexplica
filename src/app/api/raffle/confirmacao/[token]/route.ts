import { NextResponse } from 'next/server';
import { adminContainer } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = adminContainer();
  const purchase = await c.rafflePurchases.findByToken(token);
  if (!purchase || purchase.status !== 'paid') {
    return NextResponse.json({ error: 'Compra não encontrada' }, { status: 404 });
  }
  const tickets = await c.raffleTickets.listByPurchase(purchase.id);
  return NextResponse.json({
    buyer_name: purchase.buyerName,
    ticket_quantity: purchase.ticketQuantity,
    amount_cents: purchase.amountCents,
    ticket_numbers: tickets.map((t) => t.ticketNumber).sort((a, b) => a - b),
    created_at: purchase.createdAt,
  });
}
