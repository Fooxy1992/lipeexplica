import Link from 'next/link';
import { Gift, Trophy, Ticket } from 'lucide-react';

const TIERS = [
  { qty: '1–2 ações', price: 'R$ 25/un' },
  { qty: '3–4 ações', price: 'R$ 20/un' },
  { qty: '5–9 ações', price: 'R$ 18/un' },
  { qty: '10+ ações', price: 'R$ 15/un' },
];

export function AcaoSection() {
  return (
    <section
      aria-labelledby="acao-titulo"
      className="relative overflow-hidden bg-[#08090a] py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff4b2b, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center text-white">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#ff4b2b]/10">
            <Gift className="h-8 w-8 text-[#ff4b2b]" />
          </div>
          <h2
            id="acao-titulo"
            className="mt-3 font-display text-3xl font-bold sm:text-4xl"
          >
            Concorre a um Kimono Completo
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Participa da ação e apoia o canal. Quanto mais ações comprares,
            maior a tua probabilidade de ganhar — e menor o preço por ação.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/[0.08] bg-[#121314] p-6 text-center text-white">
          <Trophy className="mx-auto h-6 w-6 text-[#ff4b2b]" />
          <p className="mt-2 text-sm text-white/60">Prémio</p>
          <p className="mt-1 font-display text-2xl font-bold">Kimono Completo</p>
          <p className="mt-1 text-sm text-white/50">Sorteado 5 dias após todas as ações serem vendidas</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-3">
          {TIERS.map((t) => (
            <div
              key={t.qty}
              className="rounded-xl border border-white/[0.08] bg-[#121314] px-4 py-3 text-center text-white"
            >
              <p className="text-xs text-white/50">{t.qty}</p>
              <p className="mt-1 text-sm font-semibold text-[#ff4b2b]">{t.price}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/acao"
            className="inline-flex items-center gap-2 rounded-full bg-[#ff4b2b] px-8 py-4 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <Ticket className="h-4 w-4" />
            Comprar ações
          </Link>
          <p className="mt-3 text-xs text-white/30">200 ações no total · Pagamento via Stripe ou PIX</p>
        </div>
      </div>
    </section>
  );
}
