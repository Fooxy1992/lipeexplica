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
  Gift,
} from "lucide-react";

const NAV = [
  { href: "/admin",               label: "Visão geral",    icon: LayoutDashboard },
  { href: "/admin/products",      label: "Produtos",        icon: Package },
  { href: "/admin/purchases",     label: "Compras",         icon: ShoppingCart },
  { href: "/admin/subscriptions", label: "Assinaturas",     icon: CreditCard },
  { href: "/admin/coupons",       label: "Cupons",          icon: Ticket },
  { href: "/admin/rifa",          label: "Rifa",            icon: Gift },
  { href: "/admin/invites",       label: "Convites",        icon: Link2 },
  { href: "/admin/users",         label: "Usuários",        icon: Users },
  { href: "/admin/access",        label: "Acessos",         icon: BookOpen },
  { href: "/admin/leads",         label: "Leads",           icon: Mail },
  { href: "/admin/pages",         label: "Páginas",         icon: Eye },
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

              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={
                active
                  ? { background: "#FF4D2D", color: "#FFFFFF" }
                  : { color: "#8B92A8" }
              }
              onMouseEnter={
                active
                  ? undefined
                  : (e) => {
                      (e.currentTarget as HTMLElement).style.background = "#F5F7FF";
                      (e.currentTarget as HTMLElement).style.color = "#1C1E2E";
                    }
              }
              onMouseLeave={
                active
                  ? undefined
                  : (e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                      (e.currentTarget as HTMLElement).style.color = "#8B92A8";
                    }
              }
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
export function MobileTopNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-5 pb-3">
      {NAV.map((n) => {
        const active = pathname === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition"
            style={
              active
                ? { background: "#FF4D2D", color: "#FFFFFF" }
                : { border: "1px solid #E4EAF4", color: "#8B92A8" }
            }
          >
            <n.icon className="h-3.5 w-3.5" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** @deprecated use MobileTopNav */
export function TopNav() {
  return <MobileTopNav />;
}
