import { Ticket } from "lucide-react";
import { adminContainer } from "@/infrastructure/di/container";
import { createCoupon, toggleCoupon } from "@/app/admin/actions";
import { formatDate, formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/**
 * Cupons — o Stripe é a fonte de verdade (Coupons + Promotion Codes).
 * Tudo criado aqui vale imediatamente no checkout (campo "código promocional").
 */
export default async function AdminCouponsPage() {
  const c = adminContainer();

  let coupons: Awaited<ReturnType<typeof c.payments.listPromotionCodes>> = [];
  let stripeError: string | null = null;
  try {
    coupons = await c.payments.listPromotionCodes();
  } catch (err) {
    stripeError = err instanceof Error ? err.message : String(err);
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const labelCls =
    "block text-xs font-medium uppercase tracking-widest text-muted-foreground";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Cupons</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Criados direto no Stripe. O cliente digita o código no checkout
        (campo “Adicionar código promocional”).
      </p>

      {/* Criar cupom */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Ticket className="h-4 w-4 text-[var(--royal)]" /> Novo cupom
          </h2>
          <form action={createCoupon} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className={labelCls}>
              Código
              <input
                name="code"
                required
                placeholder="OSS10"
                className={`${inputCls} mt-1.5 font-mono uppercase`}
              />
            </label>
            <label className={labelCls}>
              Tipo
              <select name="kind" className={`${inputCls} mt-1.5`}>
                <option value="percent">% de desconto</option>
                <option value="amount">Valor fixo (R$)</option>
              </select>
            </label>
            <label className={labelCls}>
              Valor
              <input
                name="value"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="10"
                className={`${inputCls} mt-1.5`}
              />
            </label>
            <label className={labelCls}>
              Limite de usos
              <input
                name="maxRedemptions"
                type="number"
                min="1"
                placeholder="ilimitado"
                className={`${inputCls} mt-1.5`}
              />
            </label>
            <label className={labelCls}>
              Expira em
              <input name="expiresAt" type="date" className={`${inputCls} mt-1.5`} />
            </label>
            <div className="sm:col-span-2 lg:col-span-5">
              <button
                type="submit"
                className="rounded-full bg-[var(--royal)] px-6 py-2.5 text-sm font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
              >
                Criar cupom no Stripe
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      {stripeError ? (
        <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600">
          Stripe indisponível: {stripeError}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Desconto</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Expira</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((cp) => (
                <tr key={cp.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{cp.code}</td>
                  <td className="px-4 py-3">
                    {cp.percentOff
                      ? `${cp.percentOff}%`
                      : cp.amountOffCents
                        ? formatPrice(cp.amountOffCents, (cp.currency ?? "brl").toUpperCase())
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {cp.timesRedeemed}
                    {cp.maxRedemptions ? ` / ${cp.maxRedemptions}` : ""}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {cp.expiresAt ? formatDate(cp.expiresAt).split(",")[0] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        cp.active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {cp.active ? "ativo" : "inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleCoupon}>
                      <input type="hidden" name="promotionCodeId" value={cp.id} />
                      <input type="hidden" name="active" value={String(!cp.active)} />
                      <button
                        type="submit"
                        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition hover:bg-accent"
                      >
                        {cp.active ? "Desativar" : "Reativar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum cupom ainda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
