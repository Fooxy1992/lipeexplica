import Link from "next/link";
import {
  BadgeDollarSign,
  ShoppingCart,
  Users,
  BookOpen,
  Mail,
  CreditCard,
  Trophy,
} from "lucide-react";
import { adminContainer } from "@/infrastructure/di/container";
import { formatDate, formatPrice } from "@/lib/utils";
import type { ReadingProgressRow } from "@/infrastructure/supabase/database.types";

/* ─────────────────────────────────────────── SKELETONS ── */

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#EEF2FA] ${className ?? ""}`}
    />
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SkeletonBox className="h-3 w-24" />
              <SkeletonBox className="h-7 w-20" />
            </div>
            <SkeletonBox className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SalesTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E4EAF4] px-5 py-4">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-4 w-20" />
      </div>
      <div className="divide-y divide-[#F0F4FA]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-4 w-28 flex-1" />
            <SkeletonBox className="h-4 w-16" />
            <SkeletonBox className="h-6 w-14 rounded-full" />
            <SkeletonBox className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySidebarSkeleton() {
  return (
    <div className="space-y-4">
      {[5, 6].map((rows, idx) => (
        <div key={idx} className="rounded-2xl bg-white p-5 shadow-sm">
          <SkeletonBox className="mb-4 h-5 w-28" />
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBox className="h-8 w-8 shrink-0 rounded-full" />
                <SkeletonBox className="h-4 flex-1" />
                <SkeletonBox className="h-4 w-8 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────── STAT CARDS ── */

interface LeadCount {
  count: number;
}

export async function DashboardStats() {
  const c = adminContainer();
  const [purchases, products, profiles, progressRes, leadsRes, subscriptions] =
    await Promise.all([
      c.purchases.listAll(2000),
      c.products.listAll(),
      c.profiles.listAll(2000),
      c.db.from("reading_progress").select("open_count").returns<{ open_count: number | null }[]>(),
      c.db.from("leads").select("count", { count: "exact", head: true }).returns<LeadCount[]>(),
      c.subscriptions.listAll(200),
    ]);

  const paid = purchases.filter((p) => p.status === "paid");
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0);
  const opens = (progressRes.data ?? []).reduce((s, p) => s + (p.open_count ?? 0), 0);
  const activeSubs = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trialing",
  ).length;

  const stats = [
    {
      label: "Receita total",
      value: formatPrice(revenue),
      icon: BadgeDollarSign,
      href: "/admin/purchases",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.10)",
    },
    {
      label: "Vendas pagas",
      value: String(paid.length),
      icon: ShoppingCart,
      href: "/admin/purchases",
      color: "#5d87ff",
      bg: "rgba(93,135,255,0.10)",
    },
    {
      label: "Assinaturas ativas",
      value: String(activeSubs),
      icon: CreditCard,
      href: "/admin/subscriptions",
      color: "#8754ec",
      bg: "rgba(135,84,236,0.10)",
    },
    {
      label: "Usuários",
      value: String(profiles.length),
      icon: Users,
      href: "/admin/users",
      color: "#0ea5e9",
      bg: "rgba(14,165,233,0.10)",
    },
    {
      label: "Aberturas do livro",
      value: String(opens),
      icon: BookOpen,
      href: "/admin/access",
      color: "#FF4D2D",
      bg: "rgba(255,77,45,0.10)",
    },
    {
      label: "Leads capturados",
      value: String(products.length > 0 ? (leadsRes.count ?? 0) : 0),
      icon: Mail,
      href: "/admin/leads",
      color: "#10b981",
      bg: "rgba(16,185,129,0.10)",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((s) => (
        <Link key={s.label} href={s.href} className="group block">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E4EAF4] transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8B92A8]">
                  {s.label}
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold text-[#1C1E2E]">
                  {s.value}
                </p>
              </div>
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: s.bg }}
              >
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────── SALES TABLE ── */

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  paid:     { bg: "rgba(34,197,94,0.10)",  color: "#16a34a", label: "Pago" },
  refunded: { bg: "rgba(234,179,8,0.10)",  color: "#b45309", label: "Reembolsado" },
  pending:  { bg: "rgba(14,165,233,0.10)", color: "#0369a1", label: "Pendente" },
  failed:   { bg: "rgba(239,68,68,0.10)",  color: "#dc2626", label: "Falhou" },
};

export async function SalesTable() {
  const c = adminContainer();
  const [purchases, products, { data: authList }] = await Promise.all([
    c.purchases.listAll(2000),
    c.products.listAll(),
    c.db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const emailById = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email ?? "—"]),
  );
  const recentPurchases = purchases.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E4EAF4]">
      <div className="flex items-center justify-between border-b border-[#EEF2FA] px-5 py-4">
        <h2 className="font-display text-base font-semibold text-[#1C1E2E]">
          Últimas vendas
        </h2>
        <Link
          href="/admin/purchases"
          className="text-xs font-semibold text-[#FF4D2D] transition hover:opacity-70"
        >
          Ver todas →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EEF2FA] text-left">
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B92A8]">Cliente</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B92A8]">Produto</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B92A8]">Valor</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B92A8]">Status</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B92A8]">Data</th>
            </tr>
          </thead>
          <tbody>
            {recentPurchases.map((p) => {
              const st = statusStyle[p.status] ?? { bg: "#f3f4f6", color: "#6b7280", label: p.status };
              return (
                <tr
                  key={p.id}
                  className="border-b border-[#F8FAFD] transition last:border-0 hover:bg-[#F8FAFD]"
                >
                  <td className="px-5 py-3">
                    <p className="max-w-[160px] truncate text-xs font-medium text-[#1C1E2E]">
                      {emailById.get(p.userId) ?? p.userId}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="max-w-[120px] truncate text-xs text-[#8B92A8]">
                      {productById.get(p.productId)?.title ?? "—"}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-semibold text-[#1C1E2E]">
                      {formatPrice(p.amount, p.currency.toUpperCase())}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#8B92A8]">
                    {formatDate(p.createdAt)}
                  </td>
                </tr>
              );
            })}
            {recentPurchases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8B92A8]">
                  Nenhuma venda ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── ACTIVITY SIDEBAR ── */

interface LeadRow {
  id: string;
  name: string | null;
  email: string;
  source: string;
  created_at: string;
}

const AVATAR_COLORS = [
  "#FF4D2D", "#5d87ff", "#8754ec", "#0ea5e9", "#10b981", "#f59e0b",
];

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name.slice(0, 1).toUpperCase();
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

export async function ActivitySidebar() {
  const c = adminContainer();
  const [progressRes, profiles, { data: authList }, leadsRes] = await Promise.all([
    c.db.from("reading_progress").select("*").returns<ReadingProgressRow[]>(),
    c.profiles.listAll(2000),
    c.db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    c.db
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<LeadRow[]>(),
  ]);

  const progress = progressRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const emailById = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email ?? "—"]),
  );

  const topReaders = [...progress]
    .sort((a, b) => (b.open_count ?? 0) - (a.open_count ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Top readers */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E4EAF4]">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-[#1C1E2E]">
          <Trophy className="h-4 w-4 text-[#f59e0b]" />
          Top leitores
        </h2>
        <ul className="mt-4 space-y-3">
          {topReaders.map((p, i) => {
            const name =
              profileById.get(p.user_id)?.name ??
              emailById.get(p.user_id) ??
              "—";
            return (
              <li key={`${p.user_id}-${p.product_id}`} className="flex items-center gap-3">
                <Avatar name={name} index={i} />
                <p className="min-w-0 flex-1 truncate text-xs font-medium text-[#1C1E2E]">
                  {name}
                </p>
                <span className="shrink-0 text-xs font-semibold text-[#8B92A8]">
                  {p.open_count ?? 0}×
                </span>
              </li>
            );
          })}
          {topReaders.length === 0 && (
            <p className="py-4 text-center text-xs text-[#8B92A8]">Sem leituras ainda.</p>
          )}
        </ul>
      </div>

      {/* Recent leads */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E4EAF4]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-[#1C1E2E]">Últimos leads</h2>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-[#FF4D2D] transition hover:opacity-70"
          >
            Ver todos →
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {leads.map((l, i) => {
            const display = l.name ?? l.email;
            return (
              <li key={l.id} className="flex items-center gap-3">
                <Avatar name={display} index={i} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#1C1E2E]">
                    {display}
                  </p>
                  {l.name && (
                    <p className="truncate text-[10px] text-[#8B92A8]">{l.email}</p>
                  )}
                </div>
              </li>
            );
          })}
          {leads.length === 0 && (
            <p className="py-4 text-center text-xs text-[#8B92A8]">Nenhum lead ainda.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
