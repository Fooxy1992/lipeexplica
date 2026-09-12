import { adminContainer } from "@/infrastructure/di/container";
import { formatDate } from "@/lib/utils";
import type { ReadingProgressRow } from "@/infrastructure/supabase/database.types";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/** Acessos: quem abriu cada livro, quantas vezes, progresso e última leitura. */
export default async function AdminAccessPage() {
  const c = adminContainer();

  const [progressRes, products, profiles, { data: authList }] = await Promise.all([
    c.db
      .from("reading_progress")
      .select("*")
      .order("last_accessed_at", { ascending: false })
      .returns<ReadingProgressRow[]>(),
    c.products.listAll(),
    c.profiles.listAll(1000),
    c.db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const progress = progressRes.data ?? [];
  const productById = new Map(products.map((p) => [p.id, p]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const emailById = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email ?? "—"]),
  );

  const totalOpens = progress.reduce((s, p) => s + (p.open_count ?? 0), 0);
  const readers = new Set(progress.map((p) => p.user_id)).size;
  const completed = progress.filter((p) => p.completed).length;

  const stats = [
    { label: "Aberturas totais", value: String(totalOpens) },
    { label: "Leitores", value: String(readers) },
    { label: "Concluíram o livro", value: String(completed) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Acessos</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Livro</th>
              <th className="px-4 py-3">Aberturas</th>
              <th className="px-4 py-3">Progresso</th>
              <th className="px-4 py-3">Última leitura</th>
            </tr>
          </thead>
          <tbody>
            {progress.map((p) => {
              const product = productById.get(p.product_id);
              const profile = profileById.get(p.user_id);
              const pct =
                p.total_pages > 0
                  ? Math.min(100, Math.round((p.visited.length / p.total_pages) * 100))
                  : 0;
              return (
                <tr
                  key={`${p.user_id}-${p.product_id}`}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {profile?.name ?? emailById.get(p.user_id) ?? p.user_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emailById.get(p.user_id)}
                    </p>
                  </td>
                  <td className="px-4 py-3">{product?.title ?? p.product_id}</td>
                  <td className="px-4 py-3">{p.open_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, var(--royal), var(--gold))",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {pct}%{p.completed ? " ✓" : ""}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDate(p.last_accessed_at)}
                  </td>
                </tr>
              );
            })}
            {progress.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhum acesso registrado ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
