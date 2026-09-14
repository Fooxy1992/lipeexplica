'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, Ticket, Clock, Trophy } from 'lucide-react';
import type { Raffle } from '@/core/domain/entities/raffle';

// Tier pricing mirrored from calculate-raffle-price.ts (client-side preview only)
const TIERS = [
  { maxQty: 2, unitCents: 2500, label: 'R$ 25,00/bilhete' },
  { maxQty: 4, unitCents: 2000, label: 'R$ 20,00/bilhete' },
  { maxQty: 9, unitCents: 1800, label: 'R$ 18,00/bilhete' },
  { maxQty: Infinity, unitCents: 1500, label: 'R$ 15,00/bilhete' },
];

function priceForQty(qty: number) {
  return TIERS.find((t) => qty <= t.maxQty)!.unitCents * qty;
}

function unitPriceForQty(qty: number) {
  return TIERS.find((t) => qty <= t.maxQty)!.unitCents;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface Props {
  raffle: Raffle;
  initialPaid: number;
  initialReserved: number;
}

interface StatusData {
  status: string;
  total_tickets: number;
  paid_tickets: number;
  reserved_tickets: number;
  available_tickets: number;
  draw_date: string | null;
  winner_ticket_id: string | null;
}

export default function RaffleClient({ raffle, initialPaid, initialReserved }: Props) {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<StatusData>({
    status: raffle.status,
    total_tickets: raffle.totalTickets,
    paid_tickets: initialPaid,
    reserved_tickets: initialReserved,
    available_tickets: raffle.totalTickets - initialPaid - initialReserved,
    draw_date: raffle.drawDate,
    winner_ticket_id: raffle.winnerTicketId,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/raffle/${raffle.id}/status`);
      if (res.ok) setStatus(await res.json());
    } catch {
      // silently ignore network errors on poll
    }
  }, [raffle.id]);

  // Poll every 30 s
  useEffect(() => {
    const id = setInterval(fetchStatus, 30_000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const soldOut = status.available_tickets <= 0 || status.status === 'sold_out' || status.status === 'completed';
  const paidPct = Math.round((status.paid_tickets / status.total_tickets) * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (soldOut) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/raffle/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffle_id: raffle.id,
          quantity: qty,
          buyer_name: name,
          buyer_email: email,
          buyer_phone: phone || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erro ao processar. Tente novamente.');
        if (res.status === 409) fetchStatus();
        return;
      }
      window.location.href = data.session_url;
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-[oklch(0.16_0.04_265)] via-[oklch(0.20_0.05_265)] to-[oklch(0.14_0.03_260)] px-4 py-16">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--gold), transparent 60%)' }}
      />

      <div className="relative mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center text-white backdrop-blur-md">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-400/15">
            <Gift className="h-8 w-8 text-amber-300" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">
            {raffle.title}
          </h1>
          <p className="mt-2 text-white/60">{raffle.prizeName}</p>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-white/70">
              <span>{status.paid_tickets} ações vendidas</span>
              <span>{status.available_tickets} disponíveis</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${paidPct}%`,
                  background: 'linear-gradient(90deg, oklch(0.88 0.14 85), oklch(0.78 0.16 80))',
                }}
              />
            </div>
            <p className="text-xs text-white/40">{paidPct}% vendido</p>
          </div>

          {/* Draw date or winner */}
          {status.status === 'completed' && status.winner_ticket_id && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
              <Trophy className="h-4 w-4" />
              Sorteio realizado! Ação vencedora: #{status.winner_ticket_id}
            </div>
          )}
          {status.draw_date && status.status !== 'completed' && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" />
              Sorteio previsto: {new Date(status.draw_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Pricing tiers info */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-white backdrop-blur-md">
          <p className="mb-3 text-sm font-semibold text-white/80">Faixas de preço</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
            <div className="rounded-lg bg-white/5 px-3 py-2">1–2 ações · <span className="text-white/90">R$ 25/un</span></div>
            <div className="rounded-lg bg-white/5 px-3 py-2">3–4 ações · <span className="text-white/90">R$ 20/un</span></div>
            <div className="rounded-lg bg-white/5 px-3 py-2">5–9 ações · <span className="text-white/90">R$ 18/un</span></div>
            <div className="rounded-lg bg-white/5 px-3 py-2">10+ ações · <span className="text-white/90">R$ 15/un</span></div>
          </div>
        </div>

        {/* Buy form */}
        {soldOut ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-center text-white backdrop-blur-md">
            <Ticket className="mx-auto h-8 w-8 text-white/30" />
            <p className="mt-3 text-lg font-semibold">Ações esgotadas</p>
            <p className="mt-1 text-sm text-white/50">
              {status.status === 'completed' ? 'A ação já foi sorteada.' : 'Todas as ações foram reservadas ou vendidas.'}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white backdrop-blur-md"
          >
            <h2 className="mb-5 text-lg font-semibold">Participar da ação</h2>

            {/* Quick-select buttons */}
            <div className="mb-4">
              <p className="mb-2 text-sm text-white/60">Quantidade de ações</p>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQty(n)}
                    className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                      qty === n
                        ? 'border-amber-400/60 bg-amber-400/15 text-amber-300'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={status.available_tickets}
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1) setQty(Math.min(v, status.available_tickets));
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
                placeholder="Ou digite a quantidade"
              />
            </div>

            {/* Price preview */}
            <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{qty} × {formatBRL(unitPriceForQty(qty))}</span>
                <span className="font-bold text-amber-300">{formatBRL(priceForQty(qty))}</span>
              </div>
            </div>

            {/* Buyer info */}
            <div className="space-y-3">
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp (opcional)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || soldOut}
              className="mt-5 w-full rounded-full py-3.5 text-sm font-bold text-[oklch(0.20_0.04_265)] transition hover:brightness-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, oklch(0.88 0.14 85), oklch(0.78 0.16 80))' }}
            >
              {loading ? 'Processando…' : `Comprar ${qty} ação${qty > 1 ? 'ões' : ''} · ${formatBRL(priceForQty(qty))}`}
            </button>

            <p className="mt-3 text-center text-xs text-white/40">
              Pagamento via Stripe · Cartão ou PIX
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
