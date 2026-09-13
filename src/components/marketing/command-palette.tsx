"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { search, type SearchItem } from "@/lib/search";
import { cn } from "@/lib/utils";

/**
 * Busca rápida por Cmd/Ctrl+K.
 * Navegação por setas + Enter, Escape fecha e devolve o foco. A página
 * /buscar continua existindo como caminho sem JS e compartilhável.
 */
export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const resultados = useMemo(() => search(query, 8), [query]);

  const close = onClose;

  // Foco e trava de scroll enquanto o painel existe.
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    previousFocus.current = anterior;
    inputRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      anterior?.focus();
    };
  }, []);

  useEffect(() => setCursor(0), [query]);

  const irPara = useCallback(
    (item: SearchItem) => {
      onClose();
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [router, onClose],
  );

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (resultados.length === 0 ? 0 : (c + 1) % resultados.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) =>
        resultados.length === 0 ? 0 : (c - 1 + resultados.length) % resultados.length,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const alvo = resultados[cursor];
      if (alvo) {
        irPara(alvo);
      } else if (query.trim()) {
        onClose();
        router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  const activeId = resultados[cursor] ? `cmdk-${resultados[cursor].id}` : undefined;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={close}
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--background)_75%,transparent)] backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca rápida"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-[var(--surface-1)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <label htmlFor="cmdk-input" className="sr-only">
            Buscar no site
          </label>
          <input
            ref={inputRef}
            id="cmdk-input"
            type="text"
            role="combobox"
            aria-expanded
            aria-controls="cmdk-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar técnicas, termos, artigos…"
            className="min-h-14 w-full bg-transparent text-body-lg text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-caption text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          id="cmdk-list"
          role="listbox"
          aria-label="Resultados"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {resultados.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                id={`cmdk-${item.id}`}
                role="option"
                aria-selected={index === cursor}
                onMouseEnter={() => setCursor(index)}
                onClick={() => irPara(item)}
                className={cn(
                  "flex w-full min-h-12 flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                  index === cursor
                    ? "bg-[color-mix(in_oklab,var(--brand)_14%,transparent)]"
                    : "hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-caption uppercase tracking-[0.12em] text-[var(--brand)]">
                    {item.tipo}
                  </span>
                  <span className="text-body font-semibold text-foreground">
                    {item.titulo}
                  </span>
                </span>
                <span className="line-clamp-1 text-caption text-muted-foreground">
                  {item.descricao}
                </span>
              </button>
            </li>
          ))}

          {query.trim() && resultados.length === 0 ? (
            <li className="px-3 py-8 text-center text-small text-muted-foreground">
              Nada encontrado para “{query.trim()}”.
            </li>
          ) : null}

          {!query.trim() ? (
            <li className="px-3 py-8 text-center text-small text-muted-foreground">
              Digite para buscar em categorias, artigos, termos e vídeos.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
