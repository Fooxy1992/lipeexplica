import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Ticket, ArrowLeft } from 'lucide-react';
import { adminContainer } from '@/infrastructure/di/container';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Confirmação — Ação' };

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function AcaoConfirmacaoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const c = adminContainer();
  const purchase = await c.rafflePurchases.findByToken(token);

  if (!purchase || purchase.status !== 'paid') {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#08090a] px-6">
        <div className="rounded-3xl border border-white/[0.08] bg-[#121314] p-10 text-center text-white">
          <p className="text-white/60">Confirmação não encontrada ou pagamento pendente.</p>
          <Link href="/acao" className="mt-4 inline-block text-sm text-[#ff4b2b] hover:underline">
            Voltar para a ação
          </Link>
        </div>
      </div>
    );
  }

  const tickets = await c.raffleTickets.listByPurchase(purchase.id);
  const ticketNumbers = tickets.map((t) => t.ticketNumber).sort((a, b) => a - b);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#08090a] px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff4b2b, transparent 60%)' }}
      />

      <div className="relative mx-auto max-w-md">
        <div className="rounded-3xl border border-white/[0.08] bg-[#121314] p-10 text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>

          <h1 className="mt-6 text-center font-display text-2xl font-semibold">
            Pagamento confirmado!
          </h1>
          <p className="mt-2 text-center text-sm text-white/60">
            Olá, <strong>{purchase.buyerName}</strong>. As tuas ações estão garantidas.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Ações</span>
              <span>{purchase.ticketQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Total pago</span>
              <span className="font-semibold text-[#ff4b2b]">{formatBRL(purchase.amountCents)}</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
              <Ticket className="h-4 w-4" />
              Os teus números
            </p>
            <div className="flex flex-wrap gap-2">
              {ticketNumbers.map((n) => (
                <span
                  key={n}
                  className="rounded-lg border border-[#ff4b2b]/30 bg-[#ff4b2b]/10 px-3 py-1 text-sm font-mono text-[#ff4b2b]"
                >
                  #{n}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">
            Guarda esta página. O sorteio será realizado automaticamente 5 dias após todas as ações serem vendidas.
          </p>

          <Link
            href="/acao"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-[#ff4b2b] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para a ação
          </Link>
        </div>
      </div>
    </div>
  );
}
