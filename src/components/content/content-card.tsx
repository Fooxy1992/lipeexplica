import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Card de um item de conteúdo (artigo, termo do glossário ou reel).
 * Normaliza as três fontes em uma única superfície visual.
 */
export function ContentCard({
  href,
  kind,
  title,
  description,
  meta,
  external = false,
  className,
}: {
  href: string;
  /** rótulo do tipo de conteúdo, exibido como badge */
  kind: string;
  title: string;
  description?: string;
  /** linha auxiliar (tempo de leitura, visualizações…) */
  meta?: string;
  external?: boolean;
  className?: string;
}) {
  const cardClass = cn(
    "group flex h-full flex-col rounded-2xl border border-border bg-card p-5",
    "transition-[transform,border-color,background-color] duration-200 ease-[var(--ease)]",
    "hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] hover:bg-[var(--surface-2)]",
    className,
  );

  const inner = (
    <>
      <span className="flex items-center gap-2">
        <Badge variant="neutral">{kind}</Badge>
        {meta ? (
          <span className="text-caption text-muted-foreground">{meta}</span>
        ) : null}
      </span>

      <span className="mt-3 flex items-start gap-2">
        <span className="text-h3 text-foreground">{title}</span>
        {external ? (
          <ArrowUpRight
            aria-hidden
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[var(--brand)]"
          />
        ) : null}
      </span>

      {description ? (
        <span className="mt-2 line-clamp-3 text-body text-muted-foreground">
          {description}
        </span>
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
      >
        {inner}
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={cardClass}>
      {inner}
    </Link>
  );
}
