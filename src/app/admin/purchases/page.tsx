import { adminContainer } from "@/infrastructure/di/container";
import { markPurchaseRefunded } from "@/app/admin/actions";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600",
  refunded: "bg-amber-500/10 text-amber-600",
  pending: "bg-blue-500/10 text-blue-600",
  failed: "bg-red-500/10 text-red-600",
};

/** Purchase list with refund action (access revocation). */
export default async function AdminPurchasesPage() {
  const c = adminContainer();
  const [purchases, products] = await Promise.all([
    c.purchases.listAll(200),
    c.products.listAll(),
  ]);
  const productById = new Map(products.map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Compras</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Marcar como reembolsada revoga o acesso imediatamente. O estorno do
        valor é feito no Stripe Dashboard.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stripe session</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3">
                  {productById.get(p.productId)?.title ?? p.productId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatPrice(p.amount, p.currency.toUpperCase())}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[p.status] ?? ""}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                  {p.stripeSessionId}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "paid" ? (
                    <form action={markPurchaseRefunded}>
                      <input type="hidden" name="purchaseId" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent"
                      >
                        Reembolsar
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma compra ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
