import { adminContainer } from "@/infrastructure/di/container";
import { updateProduct } from "@/app/admin/actions";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/**
 * Produtos: título, preço (R$) e disponibilidade.
 * Salvar sincroniza com o Stripe: título via products.update; valor novo
 * cria um Price e arquiva o antigo — o checkout cobra o valor novo na hora.
 */
export default async function AdminProductsPage() {
  const c = adminContainer();
  const products = await c.products.listAll();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Produtos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Alterações refletem automaticamente no Stripe (preço novo = Price novo,
        o antigo é arquivado).
      </p>
      <div className="mt-8 space-y-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-6">
              <form action={updateProduct} className="grid gap-4 md:grid-cols-3">
                <input type="hidden" name="id" value={p.id} />
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground md:col-span-2">
                  Título
                  <input
                    name="title"
                    defaultValue={p.title}
                    required
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
                  />
                </label>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Preço (R$)
                  <input
                    name="priceReais"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={(p.price / 100).toFixed(2)}
                    required
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
                  />
                </label>
                <div className="flex items-center justify-between gap-4 md:col-span-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={p.active}
                      className="h-4 w-4 accent-[var(--royal)]"
                    />
                    Disponível para venda
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--royal)] px-6 py-2.5 text-sm font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
                  >
                    Salvar e sincronizar Stripe
                  </button>
                </div>
                <p className="text-xs text-muted-foreground md:col-span-3">
                  slug: <code className="font-mono">{p.slug}</code> · tipo: {p.type} ·
                  Stripe Price: <code className="font-mono">{p.stripePriceId ?? "—"}</code>
                </p>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
