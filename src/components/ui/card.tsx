import { cn } from "@/lib/utils";

/**
 * Superfície base. `interactive` adiciona o hover padrão do site
 * (elevação sutil + borda que acende no vermelho da marca).
 */
export function Card({
  className,
  interactive = false,
  elevated = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border text-card-foreground",
        elevated ? "bg-[var(--surface-2)]" : "bg-card",
        interactive &&
          "transition-[transform,border-color,background-color] duration-200 ease-[var(--ease)] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] hover:bg-[var(--surface-2)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h3", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-small text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />
  );
}
