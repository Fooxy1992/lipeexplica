import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** ações alternativas — nunca deixar o usuário sem saída */
  actions?: { href: string; label: string; primary?: boolean }[];
  children?: React.ReactNode;
  className?: string;
}

/**
 * Estado vazio honesto: diz o que não existe ainda e oferece um caminho real.
 * Usado quando uma categoria ainda não tem conteúdo — nunca preencher com
 * conteúdo fictício.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border bg-[color-mix(in_oklab,var(--surface-1)_60%,transparent)] px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span
          aria-hidden
          className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-border bg-[var(--surface-2)] text-muted-foreground"
        >
          <Icon className="h-6 w-6" />
        </span>
      ) : null}

      <p className="text-h3 text-foreground">{title}</p>

      {description ? (
        <p className="mt-2 max-w-md text-body text-muted-foreground">
          {description}
        </p>
      ) : null}

      {actions?.length ? (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={
                a.primary ? "btn-primary" : "btn-outline-site"
              }
            >
              {a.label}
            </Link>
          ))}
        </div>
      ) : null}

      {children ? <div className="mt-7 w-full max-w-md">{children}</div> : null}
    </div>
  );
}
