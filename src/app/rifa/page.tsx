import type { Metadata } from 'next';
import { adminContainer } from '@/infrastructure/di/container';
import RaffleClient from './raffle-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Rifa — Kimono Completo' };

export default async function RifaPage() {
  const c = adminContainer();
  const raffle = await c.raffleRepo.findActive();

  if (!raffle) {
    return (
      <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-[oklch(0.16_0.04_265)] via-[oklch(0.20_0.05_265)] to-[oklch(0.14_0.03_260)] px-6">
        <p className="text-white/60">Nenhuma rifa ativa no momento.</p>
      </div>
    );
  }

  const paid = await c.raffleTickets.countByStatus(raffle.id, 'paid');
  const reserved = await c.raffleTickets.countByStatus(raffle.id, 'reserved');

  return (
    <RaffleClient
      raffle={raffle}
      initialPaid={paid}
      initialReserved={reserved}
    />
  );
}
