import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconTile } from "@/components/ui/icon-tile";
import { resumoDaCategoria, type Categoria } from "@/data/categorias";
import { cn } from "@/lib/utils";

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

  return (
    <Link
      href={`/aprender/${categoria.slug}`}
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card p-6",
        "transition-[transform,border-color,background-color] duration-200 ease-[var(--ease)]",
        "hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] hover:bg-[var(--surface-2)]",
        className,
      )}
    >
      <IconTile icon={categoria.icon} size="lg" groupHover />

      <h3 className="mt-5 text-h3 text-foreground">{categoria.nome}</h3>

      <p className="mt-2 flex-1 text-body text-muted-foreground">
        {categoria.tagline}
      </p>

      <span className="mt-5 flex items-center justify-between gap-3">
        <span className="text-caption text-muted-foreground">
          {resumo ?? "Em breve"}
        </span>
        <ArrowRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]"
        />
      </span>
    </Link>
  );
}
