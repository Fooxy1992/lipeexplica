import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Compra confirmada" };

/**
 * Post-checkout landing (Stripe success_url).
 * Access is granted by the webhook; this page just orients the buyer.
 */
export default function ObrigadoPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-br from-[oklch(0.16_0.04_265)] via-[oklch(0.20_0.05_265)] to-[oklch(0.14_0.03_260)] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--gold), transparent 60%)" }}
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center text-white backdrop-blur-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15">
          <CheckCircle2 className="h-8 w-8 text-emerald-300" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">
          Pagamento aprovado! 🥋
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Sua biblioteca já está sendo liberada. Em instantes você recebe:
        </p>
        <div className="mt-6 space-y-3 text-left text-sm">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-[var(--gold)]" />
            Um email com o botão <strong>Acessar Biblioteca</strong>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <MessageCircle className="h-4 w-4 shrink-0 text-[var(--gold)]" />
            Uma mensagem no WhatsApp com o link de acesso
          </div>
        </div>
        <p className="mt-6 text-xs text-white/50">
          Entre com o <strong>mesmo email usado na compra</strong>.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-[oklch(0.20_0.04_265)] transition hover:brightness-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.88 0.14 85), oklch(0.78 0.16 80))",
          }}
        >
          Acessar minha biblioteca
        </Link>
      </div>
    </div>
  );
}
