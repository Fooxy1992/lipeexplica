import Link from "next/link";
import {
  BadgeDollarSign,
  ShoppingCart,
  Users,
  BookOpen,
  Mail,
  CreditCard,
  ArrowUpRight,
  Trophy,
} from "lucide-react";
import { adminContainer } from "@/infrastructure/di/container";
import { formatDate, formatPrice } from "@/lib/utils";
import type { ReadingProgressRow } from "@/infrastructure/supabase/database.types";

export const dynamic = "force-dynamic";

interface LeadRow {
  id: string;
  name: string | null;
  email: string;
  source: string;
  created_at: string;
}

export default async function AdminHomePage() {
  const c = adminContainer();

  const [purchases, products, profiles, progressRes, leadsRes, subscriptions, { data: authList }] =
    await Promise.all([
      c.purchases.listAll(2000),
      c.products.listAll(),
      c.profiles.listAll(2000),
      c.db.from("reading_progress").select("*").returns<ReadingProgressRow[]>(),
      c.db
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<LeadRow[]>(),
      c.subscriptions.listAll(200),
      c.db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  const paid = purchases.filter((p) => p.status === "paid");
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0);
  const progress = progressRes.data ?? [];
  const opens = progress.reduce((s, p) => s + (p.open_count ?? 0), 0);
  const leads = leadsRes.data ?? [];
  const activeSubs = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trialing",
  ).length;

  const productById = new Map(products.map((p) => [p.id, p]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const emailById = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email ?? "—"]),
  );

  const recentPurchases = purchases.slice(0, 8);
  const topReaders = [...progress]
    .sort((a, b) => (b.open_count ?? 0) - (a.open_count ?? 0))
    .slice(0, 5);

  const stats = [
    {
      label: "Receita total",
      value: formatPrice(revenue),
      icon: BadgeDollarSign,
      href: "/admin/purchases",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
    },
    {
      label: "Vendas pagas",
      value: String(paid.length),
      icon: ShoppingCart,
      href: "/admin/purchases",
      color: "#5d87ff",
      bg: "rgba(93,135,255,0.1)",
    },
    {
      label: "Assinaturas ativas",
      value: String(activeSubs),
      icon: CreditCard,
      href: "/admin/subscriptions",
      color: "#8754ec",
      bg: "rgba(135,84,236,0.1)",
    },
    {
      label: "Usuários",
      value: String(profiles.length),
      icon: Users,
      href: "/admin/users",
      color: "#49beff",
      bg: "rgba(73,190,255,0.1)",
    },
    {
      label: "Aberturas do livro",
      value: String(opens),
      icon: BookOpen,
      href: "/admin/access",
      color: "#FF4D2D",
      bg: "rgba(255,77,45,0.1)",
    },
    {
      label: "Leads capturados",
      value: String(leads.length >= 6 ? "6+" : leads.length),
      icon: Mail,
      href: "/admin/leads",
      color: "#13deb9",
      bg: "rgba(19,222,185,0.1)",
    },
  ];

  const purchaseStatusColor: Record<string, string> = {
    paid: "#22c55e",
    refunded: "#f6b51e",
    pending: "#49beff",
    failed: "#ef4444",
  };

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--royal) 8%, var(--card)), var(--card))",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--royal) 20%, transparent)" }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Painel Administrativo
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Visão Geral 🥋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualizado em {formatDate(new Date())}
          </p>
        </div>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group block">
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--royal)]/30 hover:shadow-md hover:-translate-y-0.5">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                style={{ background: s.bg }}
              >
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-0.5 font-display text-2xl font-bold text-foreground">
                  {s.value}
                </p>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground/30 transition group-hover:text-[var(--royal)]"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Activity grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent purchases - takes 2 cols */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-semibold">Últimas vendas</h2>
            <Link
              href="/admin/purchases"
              className="text-xs font-medium transition hover:underline"
              style={{ color: "var(--royal)" }}
            >
              Ver todas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Produto</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 transition last:border-0 hover:bg-accent/30"
                  >
                    <td className="px-5 py-3">
                      <p className="max-w-[160px] truncate text-xs font-medium text-foreground">
                        {emailById.get(p.userId) ?? p.userId}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="max-w-[120px] truncate text-xs text-muted-foreground">
                        {productById.get(p.productId)?.title ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-semibold text-foreground">
                        {formatPrice(p.amount, p.currency.toUpperCase())}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{
                          background: purchaseStatusColor[p.status] ?? "#a1a1aa",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                ))}
                {recentPurchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Nenhuma venda ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top readers */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Trophy className="h-4 w-4" style={{ color: "var(--gold)" }} />
              Top leitores
            </h2>
            <ul className="mt-4 space-y-3">
              {topReaders.map((p, i) => (
                <li
                  key={`${p.user_id}-${p.product_id}`}
                  className="flex items-center gap-3"
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(135deg,#FF4D2D,#ff7a5c)"
                          : "color-mix(in oklab, var(--royal) 10%, transparent)",
                      color: i === 0 ? "#fff" : "var(--royal)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {profileById.get(p.user_id)?.name ??
                        emailById.get(p.user_id) ??
                        "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {p.open_count ?? 0}×
                  </span>
                </li>
              ))}
              {topReaders.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Sem leituras ainda.
                </p>
              )}
            </ul>
          </div>

          {/* Recent leads */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Últimos leads</h2>
              <Link
                href="/admin/leads"
                className="text-xs font-medium transition hover:underline"
                style={{ color: "var(--royal)" }}
              >
                Ver todos →
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {leads.map((l) => (
                <li key={l.id} className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {l.name ? `${l.name}` : l.email}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {l.email} · {l.source}
                  </p>
                </li>
              ))}
              {leads.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Nenhum lead ainda.
                </p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
