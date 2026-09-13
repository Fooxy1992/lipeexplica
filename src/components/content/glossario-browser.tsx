"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { normalize } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { Termo } from "@/data/glossario";

/** Busca e filtro locais do glossário — instantâneos, sem ida ao servidor. */
export function GlossarioBrowser({
  termos,
  categorias,
}: {
  termos: Termo[];
  categorias: readonly Termo["categoria"][];
}) {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<Termo["categoria"] | null>(null);

  const resultados = useMemo(() => {
    const q = normalize(query);
    return termos
      .filter((t) => (categoria ? t.categoria === categoria : true))
      .filter((t) =>
        q ? normalize(`${t.nome} ${t.descricao} ${t.categoria}`).includes(q) : true,
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [termos, query, categoria]);

  const chip =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-small font-medium transition-[border-color,background-color,color] duration-200";

  return (
    <div>
      <div className="max-w-md">
        <Input
          label="Buscar termo"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: kimura, raspagem, oss…"
        />
      </div>

      <div className="mt-6" role="group" aria-label="Filtrar por categoria">
        <ul className="flex flex-wrap gap-2">
          <li>
            <button
              type="button"
              onClick={() => setCategoria(null)}
              aria-pressed={categoria === null}
              className={cn(
                chip,
                categoria === null
                  ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] text-[var(--brand)]"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              Todos
              <span className="text-caption opacity-70">{termos.length}</span>
            </button>
          </li>

          {categorias.map((c) => {
            const total = termos.filter((t) => t.categoria === c).length;
            if (total === 0) return null;
            const ativa = categoria === c;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setCategoria(ativa ? null : c)}
                  aria-pressed={ativa}
                  className={cn(
                    chip,
                    ativa
                      ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] text-[var(--brand)]"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                  <span className="text-caption opacity-70">{total}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-small text-muted-foreground">
        {resultados.length} {resultados.length === 1 ? "termo" : "termos"}
        {categoria ? ` em ${categoria}` : ""}
        {query.trim() ? ` para “${query.trim()}”` : ""}
      </p>

      {resultados.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={BookOpen}
          title="Nenhum termo encontrado"
          description="Tente outra palavra ou limpe os filtros."
          actions={[{ href: "/aprender/tecnicas", label: "Ver técnicas", primary: true }]}
        />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((t) => (
            <li key={t.slug} className="flex">
              <Link
                href={`/glossario/${t.slug}`}
                className="group flex w-full flex-col rounded-2xl border border-border bg-card p-5 transition-[transform,border-color] duration-200 ease-[var(--ease)] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)]"
              >
                <Badge variant="neutral" className="w-fit">
                  {t.categoria}
                </Badge>
                <span className="mt-3 text-h3 text-foreground">{t.nome}</span>
                <span className="mt-2 line-clamp-3 text-body text-muted-foreground">
                  {t.descricao}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
