"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-config";
import { cn } from "@/lib/utils";

/** Lista de links da navbar em telas grandes, com estado ativo real. */
export function NavDesktop() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-lg px-3.5 text-body font-medium",
                  "transition-colors duration-200 ease-[var(--ease)]",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-foreground",
                )}
              >
                {item.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3.5 bottom-1.5 h-0.5 rounded-full bg-[var(--brand)] transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
