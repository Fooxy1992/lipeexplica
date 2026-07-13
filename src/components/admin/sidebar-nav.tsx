"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NAV = [
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

export { NAV };

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {NAV.map((n) => {
        const active = pathname === n.href;
        return (
          <li key={n.href}>
            <Link
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[color-mix(in_oklab,var(--royal)_15%,transparent)] text-[var(--royal)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {n.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal scrollable version for mobile topbar */
export function TopNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto px-5 pb-3">
      {NAV.map((n) => (
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
  );
}
