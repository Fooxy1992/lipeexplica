import Link from "next/link";
import { cn } from "@/lib/utils";

const base = [
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2",
  "text-small font-medium",
  "transition-[border-color,background-color,color] duration-200 ease-[var(--ease)]",
].join(" ");

const inactive =
  "border-border bg-transparent text-muted-foreground hover:border-[color-mix(in_oklab,var(--foreground)_22%,transparent)] hover:text-foreground";

const active =
  "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] text-[var(--brand)]";

/**
 * Filtro/atalho clicável (categoria, termo relacionado).
 * Alvo de toque de 44px+ por padrão.
 */
export function Tag({
  href,
  isActive = false,
  count,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link> & {
  isActive?: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(base, isActive ? active : inactive, className)}
      {...props}
    >
      {children}
      {typeof count === "number" ? (
        <span
          className={cn(
            "text-caption tabular-nums",
            isActive ? "opacity-80" : "opacity-60",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
