import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  BookOpen,
  Ticket,
  Link2,
  Eye,
  CreditCard,
  GraduationCap,
  Library,
  Menu,
} from "lucide-react";
import { userScopedContainer } from "@/infrastructure/di/container";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/purchases", label: "Compras", icon: ShoppingCart },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/coupons", label: "Cupons", icon: Ticket },
  { href: "/admin/invites", label: "Convites", icon: Link2 },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/access", label: "Acessos", icon: BookOpen },
  { href: "/admin/leads", label: "Leads", icon: Mail },
  { href: "/admin/pages", label: "Páginas", icon: Eye },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const profile = await c.profiles.findById(user.id);
  if (!profile?.isAdmin) redirect("/library");

  return (
    <div className="site-dark min-h-dvh bg-background">
      {/* ── Fixed left sidebar (desktop only) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-md"
            style={{ background: "linear-gradient(135deg, #FF4D2D, #ff7a5c)" }}
          >
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight">
              LipeExplica
            </p>
            <p className="text-[10px] text-muted-foreground">Painel Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Navegação
          </p>
          <SidebarNav items={nav} />
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Link
            href="/library"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Library className="h-4 w-4 shrink-0" />
            Ir para Biblioteca
          </Link>
        </div>
      </aside>

      {/* ── Content area (offset by sidebar on desktop) ── */}
      <div className="flex flex-col lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/" className="font-display text-base font-bold">
              lipe<span style={{ color: "var(--royal)" }}>explica</span>
              <span
                className="ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background: "color-mix(in oklab, var(--royal) 12%, transparent)",
                  color: "var(--royal)",
                }}
              >
                admin
              </span>
            </Link>
            <Menu className="h-5 w-5 text-muted-foreground" />
          </div>
          {/* Mobile horizontal scrollable nav */}
          <nav className="flex gap-1 overflow-x-auto px-5 pb-3">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-[var(--royal)]/40 hover:text-foreground"
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
