import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** ausente = página atual */
  href?: string;
}

/**
 * Trilha de navegação. O último item é sempre a página atual e recebe
 * aria-current="page".
 *
 * Para o JSON-LD correspondente use `breadcrumbJsonLd` (abaixo) — os dois
 * leem a mesma lista, então o schema nunca diverge do que está na tela.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded transition-colors duration-200 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast && "text-foreground/80")}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight aria-hidden className="h-3.5 w-3.5 opacity-50" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** JSON-LD BreadcrumbList a partir da mesma lista exibida na página. */
export function breadcrumbJsonLd(items: Crumb[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };
}
