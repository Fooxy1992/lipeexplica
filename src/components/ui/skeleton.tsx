import { cn } from "@/lib/utils";

/**
 * Placeholder de carregamento. O pulse é desligado automaticamente sob
 * prefers-reduced-motion pela regra global em globals.css.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-xl bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

/** Região de carregamento anunciada para leitores de tela. */
export function LoadingState({
  label = "Carregando…",
  children,
  className,
}: {
  label?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
