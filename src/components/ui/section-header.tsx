import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** rótulo curto acima do título (ex.: "Método", "Explore") */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** link opcional alinhado à direita no desktop */
  action?: { href: string; label: string };
  /** nível do heading — respeita a hierarquia da página */
  as?: "h2" | "h3";
  align?: "start" | "center";
  className?: string;
  /** id para associar a seção via aria-labelledby */
  id?: string;
}

/** Abertura padrão de uma seção: eyebrow + título + descrição + ação. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  align = "start",
  className,
  id,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        centered && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "text-center")}>
        {eyebrow ? (
          <p className="text-label text-[var(--brand)]">{eyebrow}</p>
        ) : null}
        <Heading id={id} className={cn("text-h2 text-foreground", eyebrow && "mt-3")}>
          {title}
        </Heading>
        {description ? (
          <p className="mt-3 text-body text-muted-foreground measure">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-small font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          {action.label}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}
