"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContentCard } from "@/components/content/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import { search } from "@/lib/search";

/** Campo + resultados de /buscar. O `q` fica na URL para ser compartilhável. */
export function SearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const inicial = params.get("q") ?? "";
  const [query, setQuery] = useState(inicial);

  const resultados = useMemo(() => search(query, 50), [query]);
  const buscou = query.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limpo = query.trim();
    router.replace(limpo ? `/buscar?q=${encodeURIComponent(limpo)}` : "/buscar");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit} className="mx-auto max-w-xl">
        <Input
          label="Buscar no site"
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: armbar, faixa azul, ansiedade…"
          hint="Busca em categorias, artigos, termos do glossário e vídeos."
        />
      </form>

      <p role="status" aria-live="polite" className="mt-8 text-center text-small text-muted-foreground">
        {buscou
          ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"} para “${query.trim()}”`
          : "Digite para buscar."}
      </p>

      {buscou && resultados.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={SearchIcon}
          title="Nada encontrado"
          description="Tente outra palavra, ou navegue pelas categorias."
          actions={[
            { href: "/aprender", label: "Ver categorias", primary: true },
            { href: "/glossario", label: "Abrir glossário" },
          ]}
        />
      ) : null}

      {resultados.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((r) => (
            <li key={r.id} className="flex">
              <ContentCard
                href={r.href}
                kind={r.tipo}
                title={r.titulo}
                description={r.descricao}
                external={r.external}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
