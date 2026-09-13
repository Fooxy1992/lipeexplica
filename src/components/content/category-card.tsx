import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resumoDaCategoria, type Categoria } from "@/data/categorias";
import { cn } from "@/lib/utils";

/**
 * Gradiente de fundo por categoria — cria identidade visual sem depender de fotos.
 * A cor de destaque no topo faz o card parecer editorializado.
 */
const CARD_ACCENT: Record<string, string> = {
  tecnicas:
    "before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(255,75,43,0.22)_0%,transparent_65%)]",
  mentalidade:
    "before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.22)_0%,transparent_65%)]",
  historia:
    "before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(245,158,11,0.18)_0%,transparent_65%)]",
  competicoes:
    "before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(16,185,129,0.18)_0%,transparent_65%)]",
  "defesa-pessoal":
    "before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(59,130,246,0.18)_0%,transparent_65%)]",
  "sistema-de-faixas":
    "before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(124,58,237,0.20)_0%,transparent_65%)]",
};

const ICON_COLOR: Record<string, string> = {
  tecnicas: "text-[var(--brand)]",
  mentalidade: "text-violet-400",
  historia: "text-amber-400",
  competicoes: "text-emerald-400",
  "defesa-pessoal": "text-blue-400",
  "sistema-de-faixas": "text-purple-400",
};

/**
 * Card de categoria. É um <Link> de verdade — o card inteiro é clicável e
 * navegável por teclado, nunca uma <div> decorativa.
 */
export function CategoryCard({
  categoria,
  className,
}: {
  categoria: Categoria;
  className?: string;
}) {
  const resumo = resumoDaCategoria(categoria);
  const Icon = categoria.icon;
  const accentClass = CARD_ACCENT[categoria.slug] ?? "";
  const iconColor = ICON_COLOR[categoria.slug] ?? "text-[var(--brand)]";

  return (
    <Link
      href={`/aprender/${categoria.slug}`}
      className={cn(
        // base
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6",
        // pseudo-element gradient (before:)
        "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
        accentClass,
        // hover
        "transition-[transform,border-color,box-shadow] duration-200 ease-[var(--ease)]",
        "hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--brand)_40%,transparent)] hover:shadow-[0_8px_32px_-8px_rgba(255,75,43,0.18)]",
        className,
      )}
    >
      {/* Icon */}
      <div className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-[var(--surface-2)] transition-colors duration-200 group-hover:border-[color-mix(in_oklab,var(--brand)_30%,transparent)]",
      )}>
        <Icon className={cn("h-5 w-5", iconColor)} aria-hidden />
      </div>

      <h3 className="relative mt-5 text-h3 text-foreground">
        {categoria.nome}
      </h3>

      <p className="relative mt-2 flex-1 text-body text-muted-foreground">
        {categoria.tagline}
      </p>

      <span className="relative mt-5 flex items-center justify-between gap-3">
        <span className="text-caption text-muted-foreground">
          {resumo ?? "Em breve"}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-[var(--surface-2)] transition-[background-color,border-color,transform] duration-200 group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:translate-x-0.5">
          <ArrowRight
            aria-hidden
            className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-200 group-hover:text-white"
          />
        </span>
      </span>
    </Link>
  );
}
