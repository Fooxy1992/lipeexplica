import { adminContainer } from '@/infrastructure/di/container';
import { DrawRaffleButton } from './draw-raffle-button';

export const dynamic = 'force-dynamic';

const statusLabel: Record<string, string> = {
  active: 'Ativa',
  sold_out: 'Esgotada',
  drawing: 'Sorteando',
  completed: 'Concluída',
};

const purchaseStatusStyle: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-600',
  pending: 'bg-blue-500/10 text-blue-600',
  expired: 'bg-gray-500/10 text-gray-500',
  failed: 'bg-red-500/10 text-red-600',
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function AdminRifaPage() {
  const c = adminContainer();
  const raffle = await c.raffleRepo.findActive();

  if (!raffle) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Ação</h1>
        <p className="mt-4 text-sm text-muted-foreground">Nenhuma ação ativa no momento.</p>
      </div>
    );
  }

  const [paid, reserved, purchases] = await Promise.all([
    c.raffleTickets.countByStatus(raffle.id, 'paid'),
    c.raffleTickets.countByStatus(raffle.id, 'reserved'),
    c.rafflePurchases.listByRaffle(raffle.id),
  ]);

  const available = raffle.totalTickets - paid - reserved;
  const paidPurchases = purchases.filter((p) => p.status === 'paid');
  const totalArrecadado = paidPurchases.reduce((acc, p) => acc + p.amountCents, 0);
  const canDraw = raffle.status === 'sold_out';

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Ação</h1>
          <p className="mt-1 text-sm text-muted-foreground">{raffle.title} · {raffle.prizeName}</p>
        </div>
        {canDraw && (
          <DrawRaffleButton raffleId={raffle.id} />
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">Vendidos</p>
          <p className="mt-1 text-2xl font-bold">{paid}</p>
          <p className="text-xs text-muted-foreground">de {raffle.totalTickets}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">Reservados</p>
          <p className="mt-1 text-2xl font-bold">{reserved}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">Disponíveis</p>
          <p className="mt-1 text-2xl font-bold">{available}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-xs text-muted-foreground">Arrecadado</p>
          <p className="mt-1 text-xl font-bold">{formatBRL(totalArrecadado)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
          Status: {statusLabel[raffle.status] ?? raffle.status}
        </span>
        {raffle.drawDate && (
          <span className="text-xs text-muted-foreground">
            Sorteio: {new Date(raffle.drawDate).toLocaleDateString('pt-BR')}
          </span>
        )}
        {raffle.winnerTicketId && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
            Vencedor: #{raffle.winnerTicketId}
          </span>
        )}
      </div>

      {/* Purchases table */}
      <h2 className="mt-8 font-display text-xl font-semibold">Compras</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Comprador</th>
              <th className="px-4 py-3">Ações</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhuma compra ainda.
                </td>
              </tr>
            )}
            {purchases.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.buyerName}</p>
                  <p className="text-xs text-muted-foreground">{p.buyerEmail}</p>
                </td>
                <td className="px-4 py-3">{p.ticketQuantity}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatBRL(p.amountCents)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${purchaseStatusStyle[p.status] ?? ''}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
