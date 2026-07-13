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
} from "lucide-react";
import { userScopedContainer } from "@/infrastructure/di/container";

export const dynamic = "force-dynamic";

/**
 * Admin shell. Server-side gate: session + profiles.is_admin.
 * RLS re-checks every query — the flag alone never grants data access.
 */
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

  const nav = [
    { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produtos", icon: Package },
    { href: "/admin/purchases", label: "Compras", icon: ShoppingCart },
    { href: "/admin/coupons", label: "Cupons", icon: Ticket },
    { href: "/admin/invites", label: "Convites", icon: Link2 },
    { href: "/admin/users", label: "Usuários", icon: Users },
    { href: "/admin/access", label: "Acessos", icon: BookOpen },
    { href: "/admin/leads", label: "Leads", icon: Mail },
    { href: "/admin/pages", label: "Páginas", icon: Eye },
    { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  ];

  return (
    <div className="min-h-dvh bg-[color-mix(in_oklab,var(--background)_97%,var(--royal)_3%)]">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-lg font-semibold">
            lipe<span className="text-[var(--royal)]">explica</span>{" "}
            <span className="ml-1 rounded-md bg-[color-mix(in_oklab,var(--royal)_12%,transparent)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--royal)]">
              admin
            </span>
          </Link>
          <Link
            href="/library"
            className="rounded-full border border-border px-4 py-2 text-xs font-medium transition hover:bg-accent"
          >
            ← Biblioteca
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-card hover:text-foreground"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
