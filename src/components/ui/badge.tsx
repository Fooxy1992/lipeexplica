import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Rótulo curto e não interativo (categoria, status, contador).
 * Para algo clicável use <Tag> em vez disso.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label uppercase",
  {
    variants: {
      variant: {
        neutral: "border border-border bg-[var(--surface-2)] text-muted-foreground",
        brand:
          "border border-[color-mix(in_oklab,var(--brand)_35%,transparent)] bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] text-[var(--brand)]",
        solid: "bg-[var(--brand)] text-[var(--brand-foreground)]",
        outline: "border border-border bg-transparent text-muted-foreground",
        /** exclusivo do produto "50 Dinâmicas" */
        gold: "border border-[color-mix(in_oklab,var(--gold)_40%,transparent)] bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] text-[var(--gold)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
