import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bloco de ícone usado nos cards de categoria e nas etapas do método.
 * `groupHover` faz o bloco acender no vermelho da marca quando o card-pai
 * (com a classe `group`) recebe hover ou foco.
 */
export function IconTile({
  icon: Icon,
  size = "md",
  groupHover = false,
  className,
}: {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  groupHover?: boolean;
  className?: string;
}) {
  const box = {
    sm: "h-9 w-9 rounded-lg",
    md: "h-12 w-12 rounded-xl",
    lg: "h-14 w-14 rounded-2xl",
  }[size];

  const glyph = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center border border-border bg-[var(--surface-2)] text-foreground",
        "transition-[background-color,border-color,color] duration-200 ease-[var(--ease)]",
        box,
        groupHover &&
          "group-hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] group-hover:bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] group-hover:text-[var(--brand)] group-focus-visible:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] group-focus-visible:text-[var(--brand)]",
        className,
      )}
    >
      <Icon className={glyph} />
    </span>
  );
}
