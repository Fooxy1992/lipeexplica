import { Link2 } from "lucide-react";
import { adminContainer } from "@/infrastructure/di/container";
import { createInvite, toggleInvite } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import { publicEnv } from "@/lib/env";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/admin/copy-button";
import { DeleteInviteButton } from "@/components/admin/delete-invite-button";

export const dynamic = "force-dynamic";

interface InviteRow {
  id: string;
  token: string;
  product_id: string;
  note: string | null;
  max_uses: number;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  access_type: "full" | "preview";
}

/**
 * Convites: links de acesso para quem pagou fora do Stripe (Pix, dinheiro).
 * Quem abre o link cria a conta (ou entra) e recebe o produto na biblioteca.
 */
export default async function AdminInvitesPage() {
  const c = adminContainer();
  const [invitesRes, products] = await Promise.all([
    c.db
      .from("invites")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<InviteRow[]>(),
    c.products.listAll(),
  ]);
  const invites = invitesRes.data ?? [];
  const productById = new Map(products.map((p) => [p.id, p]));
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const labelCls =
    "block text-xs font-medium uppercase tracking-widest text-muted-foreground";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Convites</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Para vendas fora do Stripe (Pix, dinheiro): gere o link, envie ao
        comprador — ele cria a conta e recebe o acesso na hora.
      </p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Link2 className="h-4 w-4 text-[var(--royal)]" /> Novo convite
          </h2>
          <form action={createInvite} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className={labelCls}>
              Produto
              <select name="productId" required className={`${inputCls} mt-1.5`}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Tipo de acesso
              <select name="accessType" className={`${inputCls} mt-1.5`}>
                <option value="full">Acesso completo</option>
                <option value="preview">Preview (páginas configuradas)</option>
              </select>
            </label>
            <label className={labelCls}>
              Usos permitidos
              <input
                name="maxUses"
                type="number"
                min="1"
                defaultValue="1"
                className={`${inputCls} mt-1.5`}
              />
            </label>
            <label className={labelCls}>
              Expira em
              <input name="expiresAt" type="date" className={`${inputCls} mt-1.5`} />
            </label>
            <label className={labelCls}>
              Nota interna
              <input
                name="note"
                placeholder="ex.: pagou via Pix — João"
                className={`${inputCls} mt-1.5 normal-case`}
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="rounded-full bg-[var(--royal)] px-6 py-2.5 text-sm font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
              >
                Gerar link de convite
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-3">
        {invites.map((inv) => {
          const url = `${base}/convite/${inv.token}`;
          const exhausted = inv.used_count >= inv.max_uses;
          const expired = inv.expires_at
            ? new Date(inv.expires_at) < new Date()
            : false;
          const status = !inv.active
            ? { t: "revogado", cls: "bg-zinc-500/10 text-zinc-500" }
            : expired
              ? { t: "expirado", cls: "bg-amber-500/10 text-amber-600" }
              : exhausted
                ? { t: "esgotado", cls: "bg-amber-500/10 text-amber-600" }
                : { t: "ativo", cls: "bg-emerald-500/10 text-emerald-600" };

          return (
            <div key={inv.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {productById.get(inv.product_id)?.title ?? "—"}
                    </p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}>
                      {status.t}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {url}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mr-1.5 ${inv.access_type === "preview" ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                      {inv.access_type === "preview" ? "preview" : "completo"}
                    </span>
                    Usos: {inv.used_count}/{inv.max_uses}
                    {inv.expires_at
                      ? ` · expira ${formatDate(inv.expires_at).split(",")[0]}`
                      : ""}
                    {inv.note ? ` · ${inv.note}` : ""} · criado{" "}
                    {formatDate(inv.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyButton text={url} />
                  <form action={toggleInvite}>
                    <input type="hidden" name="inviteId" value={inv.id} />
                    <input type="hidden" name="active" value={String(!inv.active)} />
                    <button
                      type="submit"
                      className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition hover:bg-accent"
                    >
                      {inv.active ? "Revogar" : "Reativar"}
                    </button>
                  </form>
                  <DeleteInviteButton inviteId={inv.id} />
                </div>
              </div>
            </div>
          );
        })}
        {invites.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum convite ainda.
          </p>
        ) : null}
      </div>
    </div>
  );
}
