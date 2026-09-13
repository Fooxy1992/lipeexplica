import { adminContainer } from "@/infrastructure/di/container";
import {
  toggleUserAdmin,
  grantProductAccess,
  revokeProductAccess,
} from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import type { ReadingProgressRow } from "@/infrastructure/supabase/database.types";

export const dynamic = "force-dynamic";

/**
 * Gestão de usuários: email, admin, produtos com acesso, leitura.
 * Ações: tornar/remover admin, conceder e revogar acesso por produto.
 */
export default async function AdminUsersPage() {
  const c = adminContainer();

  const [{ data: authList, error: authError }, profiles, purchases, products, progressRes] =
    await Promise.all([
      c.db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      c.profiles.listAll(1000),
      c.purchases.listAll(2000),
      c.products.listAll(),
      c.db.from("reading_progress").select("*").returns<ReadingProgressRow[]>(),
    ]);
  if (authError) throw authError;

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const progress = progressRes.data ?? [];

  const paidByUser = new Map<string, Set<string>>();
  for (const p of purchases) {
    if (p.status !== "paid") continue;
    const set = paidByUser.get(p.userId) ?? new Set<string>();
    set.add(p.productId);
    paidByUser.set(p.userId, set);
  }
  const progressByUser = new Map<string, ReadingProgressRow[]>();
  for (const pr of progress) {
    const arr = progressByUser.get(pr.user_id) ?? [];
    arr.push(pr);
    progressByUser.set(pr.user_id, arr);
  }

  const users = authList.users
    .map((u) => {
      const profile = profileById.get(u.id);
      const owned = paidByUser.get(u.id) ?? new Set<string>();
      const prog = progressByUser.get(u.id) ?? [];
      const opens = prog.reduce((s, p) => s + (p.open_count ?? 0), 0);
      const lastAccess = prog
        .map((p) => p.last_accessed_at)
        .sort()
        .at(-1);
      const lastActivity = [profile?.lastSeenAt, lastAccess, u.last_sign_in_at]
        .filter((d): d is string => Boolean(d))
        .sort()
        .at(-1);
      return {
        id: u.id,
        email: u.email ?? "—",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at,
        name: profile?.name ?? null,
        phone: profile?.phone ?? null,
        isAdmin: profile?.isAdmin ?? false,
        owned,
        opens,
        lastAccess,
        // Activity = heartbeat, reading, or (as a floor) the last real sign-in.
        lastActivity,
        // Bought but never signed in: the account exists only because the
        // Stripe webhook created it. Actionable — resend the magic link.
        neverActivated: !lastActivity,
      };
    })
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const inactiveCount = users.filter((u) => u.neverActivated).length;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Usuários</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {users.length} usuário(s)
        {inactiveCount > 0
          ? ` · ${inactiveCount} nunca acessaram a conta`
          : ""}
        . Conceder acesso cria uma compra cortesia (R$ 0). Revogar marca as
        compras do produto como reembolsadas.
      </p>

      <div className="mt-8 space-y-4">
        {users.map((u) => (
          <div key={u.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {u.name ?? u.email}
                  {u.isAdmin ? (
                    <span className="ml-2 rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--gold-foreground)]">
                      Admin
                    </span>
                  ) : null}
                  {u.neverActivated ? (
                    <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Não ativada
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cadastro: {u.createdAt ? formatDate(u.createdAt) : "—"}
                  {u.phone ? ` · ${u.phone}` : ""}
                </p>
                {u.neverActivated ? (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    Nunca acessou · conta criada na compra
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Última atividade:{" "}
                      {u.lastActivity ? formatDate(u.lastActivity) : "—"}
                    </p>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      title="last_sign_in_at só muda em login novo — sessões renovadas não contam"
                    >
                      Último login: {u.lastSignIn ? formatDate(u.lastSignIn) : "nunca"}
                    </p>
                  </>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Aberturas do livro: <strong>{u.opens}</strong>
                  {u.lastAccess ? ` · Última leitura: ${formatDate(u.lastAccess)}` : ""}
                </p>
              </div>

              <form action={toggleUserAdmin}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium transition hover:bg-accent"
                >
                  {u.isAdmin ? "Remover admin" : "Tornar admin"}
                </button>
              </form>
            </div>

            {/* Acesso por produto */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              {products.map((prod) => {
                const has = u.owned.has(prod.id);
                return (
                  <form
                    key={prod.id}
                    action={has ? revokeProductAccess : grantProductAccess}
                    className="inline"
                  >
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="productId" value={prod.id} />
                    <button
                      type="submit"
                      title={has ? "Revogar acesso" : "Conceder acesso cortesia"}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                        has
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-red-500/10 hover:text-red-500"
                          : "border-border text-muted-foreground hover:border-[var(--royal)] hover:text-foreground"
                      }`}
                    >
                      {has ? "✓ " : "+ "}
                      {prod.title.length > 30
                        ? `${prod.title.slice(0, 30)}…`
                        : prod.title}
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        ))}
        {users.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">Nenhum usuário.</p>
        ) : null}
      </div>
    </div>
  );
}
