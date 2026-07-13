"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Heart,
  Search,
  Shuffle,
  Home,
  Moon,
  Sun,
  X,
  Award,
  Sparkles,
  Library,
} from "lucide-react";
import Link from "next/link";
import { dinamicas, categorias } from "@/data/dinamicas";
import {
  useReadingProgress,
  type InitialProgress,
} from "@/hooks/use-reading-progress";
import { BookCover } from "./BookCover";
import { BookSpread } from "./BookSpread";
import { BookImage } from "./BookImage";
import { PremiumConversionScreen } from "./PremiumConversionScreen";
import { PreviewBanner } from "./PreviewBanner";
import type { Categoria } from "@/types/book";

interface BookAppProps {
  /** Product being read — progress is synced per product. */
  productId: string;
  /** Server-side progress snapshot (null on first read). */
  initialProgress: InitialProgress | null;
  /** Whether the user has full or preview access. */
  accessLevel: 'full' | 'preview';
  /** Page indices (0-based) visible to preview users. Empty when accessLevel='full'. */
  previewPageIndices: number[];
}

/**
 * Interactive book reader for "50 Dinâmicas para Jiu-Jitsu Infantil".
 * Rendered only behind the access gate in /books/[slug].
 */
export function BookApp({ productId, initialProgress, accessLevel, previewPageIndices }: BookAppProps) {
  const { state, hydrated, toggleFavorite, setLastPage, toggleTheme } =
    useReadingProgress(productId, dinamicas.length, initialProgress);
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [panel, setPanel] = useState<null | "index" | "favorites" | "search">(null);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<Categoria | "Todas">("Todas");
  const [showCert, setShowCert] = useState(false);
  const [showConversionScreen, setShowConversionScreen] = useState(false);

  const previewSet = useMemo(() => new Set(previewPageIndices), [previewPageIndices]);
  const isPreview = accessLevel === 'preview';

  const total = dinamicas.length;
  const current = dinamicas[page] ?? dinamicas[0]!;

  // Restore last page on open
  useEffect(() => {
    if (opened && hydrated) setPage(state.lastPage || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, hydrated]);

  // Persist page on change
  useEffect(() => {
    if (!opened || !hydrated) return;
    setLastPage(page, total);
    if (page === total - 1) {
      const t = setTimeout(() => setShowCert(true), 800);
      return () => clearTimeout(t);
    }
  }, [page, opened, hydrated, total, setLastPage]);

  const go = (dir: 1 | -1) => {
    setPage((p) => {
      const next = Math.min(Math.max(p + dir, 0), total - 1);
      if (next !== p) {
        setDirection(dir);
        // Block navigation to locked pages in preview mode
        if (isPreview && !previewSet.has(next)) {
          setTimeout(() => setShowConversionScreen(true), 0);
          return p; // stay on current page
        }
      }
      return next;
    });
  };

  // Keyboard
  useEffect(() => {
    if (!opened) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  // Swipe
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) setTouchStart({ x: t.clientX, y: t.clientY });
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    // only trigger if clearly horizontal (|dx| > |dy| and exceeds threshold)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    setTouchStart(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dinamicas.filter((d) => {
      if (catFilter !== "Todas" && d.categoria !== catFilter) return false;
      if (!q) return true;
      return (
        d.titulo.toLowerCase().includes(q) ||
        d.categoria.toLowerCase().includes(q) ||
        d.idade.toLowerCase().includes(q) ||
        d.objetivo.toLowerCase().includes(q)
      );
    });
  }, [query, catFilter]);

  const progressPct = ((page + 1) / total) * 100;

  if (!opened) {
    return (
      <BookCover
        count={total}
        minutes={Math.round(total * 1.2)}
        onOpen={() => setOpened(true)}
      />
    );
  }

  return (
    <div className="site-dark relative min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        {isPreview && (
          <PreviewBanner
            productSlug="50dinamicas"
            previewCount={previewPageIndices.length}
            totalCount={total}
          />
        )}
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setPanel("index")}
              aria-label="Abrir índice"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card transition hover:bg-accent"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">
                50 Dinâmicas · Jiu-Jitsu Infantil
              </p>
              <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                {current.categoria} · Dinâmica {current.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/library"
              aria-label="Voltar à biblioteca"
              title="Voltar à biblioteca"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-accent"
            >
              <Library className="h-4 w-4" />
            </Link>
            <IconBtn onClick={() => setPanel("search")} label="Pesquisar">
              <Search className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={() => setPanel("favorites")} label="Favoritos">
              <Heart className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              onClick={() => {
                const rand = Math.floor(Math.random() * total);
                setDirection(rand > page ? 1 : -1);
                setPage(rand);
              }}
              label="Dinâmica aleatória"
            >
              <Shuffle className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={toggleTheme} label="Alternar tema">
              {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconBtn>
            <IconBtn onClick={() => setOpened(false)} label="Voltar para capa">
              <Home className="h-4 w-4" />
            </IconBtn>
          </div>
        </div>
        {/* progress */}
        <div className="h-0.5 w-full bg-muted">
          <motion.div
            className="h-full"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, var(--royal), var(--gold))" }}
          />
        </div>
      </header>

      {/* Book area */}
      <main
        className="relative mx-auto flex max-w-5xl items-center justify-center px-2 py-2 sm:px-6 sm:py-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* prev */}
        <button
          onClick={() => go(-1)}
          aria-label="Página anterior"
          disabled={page === 0}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-3 shadow-sm transition hover:scale-105 disabled:opacity-30 md:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Mobile: fill available viewport height. Desktop: fixed aspect ratio. */}
        <div className="relative h-[calc(100dvh-140px)] w-full max-w-[560px] md:h-auto md:aspect-[4/5]">
          <BookSpread
            dinamica={current}
            index={page}
            total={total}
            direction={direction}
            isFavorite={state.favorites.includes(current.id)}
            onToggleFavorite={() => toggleFavorite(current.id)}
          />
        </div>

        {/* next */}
        <button
          onClick={() => go(1)}
          aria-label="Próxima página"
          disabled={page === total - 1}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-3 shadow-sm transition hover:scale-105 disabled:opacity-30 md:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </main>

      {/* Bottom nav for mobile */}
      <nav className="sticky bottom-0 z-20 border-t border-border/70 bg-background/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => go(-1)}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <p className="text-xs text-muted-foreground">
            {page + 1} / {total}
          </p>
          <button
            onClick={() => go(1)}
            disabled={page === total - 1}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--royal)", color: "var(--royal-foreground)" }}
          >
            Próxima <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Side panel */}
      <AnimatePresence>
        {panel && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanel(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-border bg-background"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  {panel === "index" && <Menu className="h-4 w-4" />}
                  {panel === "favorites" && <Heart className="h-4 w-4" />}
                  {panel === "search" && <Search className="h-4 w-4" />}
                  <h2 className="font-display text-lg font-semibold">
                    {panel === "index" && "Índice"}
                    {panel === "favorites" && "Minhas Favoritas"}
                    {panel === "search" && "Pesquisar"}
                  </h2>
                </div>
                <button
                  onClick={() => setPanel(null)}
                  aria-label="Fechar"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {panel === "search" && (
                <div className="border-b border-border p-4">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por título, idade, objetivo..."
                    className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none ring-0 focus:border-[var(--royal)]"
                  />
                </div>
              )}

              {(panel === "index" || panel === "search") && (
                <div className="flex flex-wrap gap-1.5 border-b border-border p-4">
                  <FilterChip
                    active={catFilter === "Todas"}
                    onClick={() => setCatFilter("Todas")}
                  >
                    Todas
                  </FilterChip>
                  {categorias.map((c) => (
                    <FilterChip
                      key={c}
                      active={catFilter === c}
                      onClick={() => setCatFilter(c as Categoria)}
                    >
                      {c}
                    </FilterChip>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                {panel === "favorites" ? (
                  state.favorites.length === 0 ? (
                    <EmptyState
                      icon={<Heart className="h-6 w-6" />}
                      title="Nenhuma favorita ainda"
                      body="Toque no coração de uma dinâmica para salvar aqui."
                    />
                  ) : (
                    <ul className="space-y-2">
                      {dinamicas
                        .filter((d) => state.favorites.includes(d.id))
                        .map((d) => (
                          <IndexItem
                            key={d.id}
                            d={d}
                            onClick={() => {
                              const idx = dinamicas.findIndex((x) => x.id === d.id);
                              setDirection(idx > page ? 1 : -1);
                              setPage(idx);
                              setPanel(null);
                            }}
                          />
                        ))}
                    </ul>
                  )
                ) : (
                  <ul className="space-y-2">
                    {filtered.map((d) => (
                      <IndexItem
                        key={d.id}
                        d={d}
                        active={d.id === current.id}
                        onClick={() => {
                          const idx = dinamicas.findIndex((x) => x.id === d.id);
                          setDirection(idx > page ? 1 : -1);
                          setPage(idx);
                          setPanel(null);
                        }}
                      />
                    ))}
                    {filtered.length === 0 && (
                      <EmptyState
                        icon={<Search className="h-6 w-6" />}
                        title="Nada encontrado"
                        body="Tente outra palavra-chave ou remova o filtro."
                      />
                    )}
                  </ul>
                )}
              </div>

              <div className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
                Você concluiu {Math.round((state.visited.length / total) * 100)}% do livro
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Premium conversion screen (preview mode) */}
      <AnimatePresence>
        {showConversionScreen && (
          <PremiumConversionScreen
            productSlug="50dinamicas"
            onDismiss={() => setShowConversionScreen(false)}
          />
        )}
      </AnimatePresence>

      {/* Certificate modal */}
      <AnimatePresence>
        {showCert && state.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
                style={{ background: "radial-gradient(circle, var(--gold), transparent 60%)" }}
              />
              <div className="relative">
                <div
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #FF4D2D, #ff7a5c)" }}
                >
                  <Award className="h-8 w-8 text-white" />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" /> Parabéns
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold">
                  Você concluiu o livro!
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  50 dinâmicas percorridas. Agora é hora de levar tudo isso para o tatame
                  e transformar as suas aulas.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md"
                    style={{ background: "linear-gradient(135deg, #FF4D2D, #ff7a5c)" }}
                  >
                    Baixar Certificado
                  </button>
                  <button
                    onClick={() => setShowCert(false)}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-medium"
                  >
                    Continuar lendo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-accent"
    >
      {children}
    </button>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-[11px] font-medium transition"
      style={
        active
          ? {
              background: "var(--royal)",
              color: "var(--royal-foreground)",
              borderColor: "var(--royal)",
            }
          : { borderColor: "var(--border)" }
      }
    >
      {children}
    </button>
  );
}

function IndexItem({
  d,
  onClick,
  active,
}: {
  d: (typeof dinamicas)[number];
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition hover:border-[var(--royal)] hover:bg-accent/50"
        style={active ? { borderColor: "var(--royal)" } : undefined}
      >
        <BookImage
          dinamicaId={d.id}
          categoria={d.categoria}
          titulo={d.titulo}
          className="h-14 w-20 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {String(d.id).padStart(2, "0")} · {d.categoria}
          </p>
          <p className="truncate font-display text-sm font-semibold">{d.titulo}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {d.idade} · {d.tempo}
          </p>
        </div>
      </button>
    </li>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="grid place-items-center py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card text-muted-foreground">
        {icon}
      </div>
      <p className="mt-4 font-display text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
