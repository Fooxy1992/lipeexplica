"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {items.map((n) => {
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
