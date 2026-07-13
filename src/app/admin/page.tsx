import Link from "next/link";
import {
  BadgeDollarSign,
  ShoppingCart,
  Undo2,
  Package,
  Users,
  BookOpen,
  Mail,
  ArrowUpRight,
  Trophy,
  Eye,
  CreditCard,
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

/** Visão geral do admin — métricas + atividade recente. */
export default async function AdminHomePage() {
  const c = adminContainer();
  const [purchases, products, profiles, progressRes, leadsRes, { data: authList }] =
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
      c.db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  const paid = purchases.filter((p) => p.status === "paid");
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0);
  const refunded = purchases.filter((p) => p.status === "refunded").length;
  const progress = progressRes.data ?? [];
  const opens = progress.reduce((s, p) => s + (p.open_count ?? 0), 0);
  const leads = leadsRes.data ?? [];

  const productById = new Map(products.map((p) => [p.id, p]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const emailById = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email ?? "—"]),
  );

  const recentPurchases = purchases.slice(0, 6);
  const topReaders = [...progress]
    .sort((a, b) => (b.open_count ?? 0) - (a.open_count ?? 0))
    .slice(0, 5);

  const stats = [
    {
      label: "Receita",
      value: formatPrice(revenue),
      icon: BadgeDollarSign,
      href: "/admin/purchases",
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Vendas pagas",
      value: String(paid.length),
      icon: ShoppingCart,
      href: "/admin/purchases",
      accent: "text-[var(--royal)] bg-[color-mix(in_oklab,var(--royal)_12%,transparent)]",
    },
    {
      label: "Reembolsos",
      value: String(refunded),
      icon: Undo2,
      href: "/admin/purchases",
      accent: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Produtos ativos",
      value: String(products.filter((p) => p.active).length),
      icon: Package,
      href: "/admin/products",
      accent: "text-violet-500 bg-violet-500/10",
    },
    {
      label: "Usuários",
      value: String(profiles.length),
      icon: Users,
      href: "/admin/users",
      accent: "text-sky-500 bg-sky-500/10",
    },
    {
      label: "Aberturas do livro",
      value: String(opens),
      icon: BookOpen,
      href: "/admin/access",
      accent: "text-rose-500 bg-rose-500/10",
    },
    {
      label: "Leads",
      value: String(leads.length >= 6 ? "6+" : leads.length),
      icon: Mail,
      href: "/admin/leads",
      accent: "text-teal-500 bg-teal-500/10",
    },
    {
      label: "Páginas do livro",
      value: "Preview",
      icon: Eye,
      href: "/admin/pages",
      accent: "text-indigo-500 bg-indigo-500/10",
    },
    {
      label: "Assinaturas",
      value: "Gerenciar",
      icon: CreditCard,
      href: "/admin/subscriptions",
      accent: "text-purple-500 bg-purple-500/10",
    },
  ];

  const statusStyles: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600",
    refunded: "bg-amber-500/10 text-amber-600",
    pending: "bg-blue-500/10 text-blue-600",
    failed: "bg-red-500/10 text-red-600",
  };

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Visão geral</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Atualizado {formatDate(new Date())}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <div className="h-full rounded-2xl border border-border bg-card p-5 transition group-hover:-translate-y-0.5 group-hover:border-[var(--royal)]/40 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.accent}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:text-[var(--royal)]" />
              </div>
              <p className="mt-4 font-display text-2xl font-semibold tracking-tight">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Atividade */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Últimas vendas */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Últimas vendas</h2>
            <Link href="/admin/purchases" className="text-xs font-medium text-[var(--royal)] hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentPurchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {emailById.get(p.userId) ?? p.userId}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {productById.get(p.productId)?.title ?? "—"} ·{" "}
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatPrice(p.amount, p.currency.toUpperCase())}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[p.status] ?? ""}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
            {recentPurchases.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma venda ainda.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          {/* Top leitores */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Trophy className="h-4 w-4 text-[var(--gold)]" /> Top leitores
            </h2>
            <div className="mt-3 space-y-2">
              {topReaders.map((p, i) => (
                <div key={`${p.user_id}-${p.product_id}`} className="flex items-center gap-3">
                  <span className="w-5 text-center font-display text-sm font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profileById.get(p.user_id)?.name ??
                        emailById.get(p.user_id) ??
                        "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {p.open_count ?? 0}×
                  </span>
                </div>
              ))}
              {topReaders.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Sem leituras ainda.
                </p>
              ) : null}
            </div>
          </div>

          {/* Últimos leads */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Últimos leads</h2>
              <Link href="/admin/leads" className="text-xs font-medium text-[var(--royal)] hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {leads.map((l) => (
                <div key={l.id} className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {l.name ? `${l.name} · ` : ""}
                    {l.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {l.source} · {formatDate(l.created_at)}
                  </p>
                </div>
              ))}
              {leads.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum lead ainda.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
