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
  BookOpen,
  Sparkles,
  Library,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { situacoes, categoriasMentais, type CategoriaMental } from "@/data/mental";
import {
  useReadingProgress,
  type InitialProgress,
} from "@/hooks/use-reading-progress";
import { MentalPage } from "./MentalPage";
import { PremiumConversionScreen } from "./PremiumConversionScreen";
import { PreviewBanner } from "./PreviewBanner";

interface MentalAppProps {
  productId: string;
  initialProgress: InitialProgress | null;
  accessLevel: "full" | "preview";
  previewPageIndices: number[];
}

export function MentalApp({
  productId,
  initialProgress,
  accessLevel,
  previewPageIndices,
}: MentalAppProps) {
  const { state, hydrated, toggleFavorite, setLastPage, toggleTheme } =
    useReadingProgress(productId, situacoes.length, initialProgress);

  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [panel, setPanel] = useState<null | "index" | "favorites" | "search">(null);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<CategoriaMental | "Todas">("Todas");
  const [showConversionScreen, setShowConversionScreen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  const previewSet = useMemo(() => new Set(previewPageIndices), [previewPageIndices]);
  const isPreview = accessLevel === "preview";
  const total = situacoes.length;
  const current = situacoes[page] ?? situacoes[0]!;

  useEffect(() => {
    if (opened && hydrated) setPage(state.lastPage || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, hydrated]);

  useEffect(() => {
    if (!opened || !hydrated) return;
    setLastPage(page, total);
  }, [page, opened, hydrated, total, setLastPage]);

  const goToPage = (idx: number, dir?: 1 | -1) => {
    if (isPreview && !previewSet.has(idx)) {
      setShowConversionScreen(true);
      return;
    }
    if (dir !== undefined) setDirection(dir);
    setPage(idx);
    setPanel(null);
  };

  const go = (dir: 1 | -1) => {
    const next = Math.min(Math.max(page + dir, 0), total - 1);
    if (next !== page) goToPage(next, dir);
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
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    setTouchStart(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return situacoes.filter((s) => {
      if (catFilter !== "Todas" && s.categoria !== catFilter) return false;
      if (!q) return true;
      return (
        s.titulo.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q) ||
        s.situacao.toLowerCase().includes(q) ||
        s.frase.toLowerCase().includes(q)
      );
    });
  }, [query, catFilter]);

  const progressPct = ((page + 1) / total) * 100;

  // ── COVER ──────────────────────────────────────────────────────────
  if (!opened) {
    return (
      <div className="grid-bg relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131313] px-6 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#FF4D2D]/10 blur-3xl"
        />
        <div className="relative grid w-full max-w-6xl items-center gap-14 md:grid-cols-2">
          {/* 3D book mockup */}
          <div className="mx-auto" style={{ perspective: "1800px" }}>
            <motion.div
              initial={{ rotateY: 20, rotateX: 8, y: 40, opacity: 0 }}
              animate={{ rotateY: -18, rotateX: 6, y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ rotateY: -12, rotateX: 4 }}
              className="relative aspect-[3/4] w-[280px] sm:w-[340px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                aria-hidden
                className="absolute inset-y-0 -left-1 w-3 rounded-l-md"
                style={{ background: "linear-gradient(90deg, #000, transparent)", transform: "translateZ(-6px)" }}
              />
              <div className="absolute inset-0 overflow-hidden rounded-r-2xl rounded-l-md border border-[#FF4D2D]/25 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                {!coverFailed ? (
                  <Image
                    src="/mental-cover.webp"
                    alt="Capa: O Mental do Tatame"
                    fill
                    priority
                    sizes="340px"
                    className="object-cover"
                    onError={() => setCoverFailed(true)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e0e] via-[#1c1b1b] to-[#131313]" />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(19,19,19,0.5) 0%, transparent 35%, transparent 55%, rgba(19,19,19,0.9) 100%)" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-7 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffb4a5]">lipeexplica</p>
                  <div className="mt-auto">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">O Mental do</p>
                    <h1 className="mt-1 text-3xl font-black leading-tight text-white sm:text-4xl">
                      Tatame
                    </h1>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                      50 situações de mentalidade no jiu-jitsu
                    </p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/40">OSS 🥋</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white"
          >
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF4D2D]/30 bg-[#FF4D2D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#ffb4a5]">
              <Sparkles className="h-3 w-3" /> Edição interativa
            </p>
            <h2 className="text-4xl font-black leading-tight sm:text-5xl">
              O que passa pela sua cabeça{" "}
              <span className="text-[#FF4D2D]">no tatame</span> é o que te limita.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a1a1aa]">
              50 situações reais que todo praticante de jiu-jitsu vive. Cada uma com a
              realidade por trás do pensamento, o que fazer, e uma frase para levar ao treino.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
              <CoverStat icon={<BookOpen className="h-4 w-4" />} label="Situações" value={String(total)} />
              <CoverStat icon={<Sparkles className="h-4 w-4" />} label="Categorias" value="6" />
            </div>

            <motion.button
              onClick={() => setOpened(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary mt-10"
            >
              <BookOpen className="h-4 w-4" />
              Abrir Livro
            </motion.button>

            <p className="mt-6 text-xs text-white/40">Autor: lipeexplica — OSS 🥋</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── READER ─────────────────────────────────────────────────────────
  return (
    <div className="site-dark relative min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        {isPreview && (
          <PreviewBanner
            productSlug="mental-do-tatame"
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
                O Mental do Tatame
              </p>
              <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                {current.categoria} · Situação {current.id}
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
                goToPage(rand, rand > page ? 1 : -1);
              }}
              label="Situação aleatória"
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
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-muted">
          <motion.div
            className="h-full"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, #FF4D2D, #818cf8)" }}
          />
        </div>
      </header>

      {/* Book area */}
      <main
        className="relative mx-auto flex max-w-5xl items-center justify-center px-2 py-2 sm:px-6 sm:py-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          onClick={() => go(-1)}
          aria-label="Página anterior"
          disabled={page === 0}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-3 shadow-sm transition hover:scale-105 disabled:opacity-30 md:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="relative h-[calc(100dvh-140px)] w-full max-w-[560px] md:h-auto md:aspect-[4/5]">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ rotateY: direction === 1 ? -90 : 90, opacity: 0.4, transformOrigin: direction === 1 ? "left center" : "right center" }}
              animate={{ rotateY: 0, opacity: 1, transformOrigin: direction === 1 ? "left center" : "right center" }}
              exit={{ rotateY: direction === 1 ? 90 : -90, opacity: 0.3, transformOrigin: direction === 1 ? "right center" : "left center" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              style={{ perspective: "2400px" }}
            >
              <MentalPage
                situacao={current}
                index={page}
                total={total}
                isFavorite={state.favorites.includes(current.id)}
                onToggleFavorite={() => toggleFavorite(current.id)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(1)}
          aria-label="Próxima página"
          disabled={page === total - 1}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-3 shadow-sm transition hover:scale-105 disabled:opacity-30 md:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </main>

      {/* Mobile bottom nav */}
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
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-white disabled:opacity-40"
            style={{ background: "#FF4D2D" }}
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
                    placeholder="Buscar por título, categoria, frase..."
                    className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-[#FF4D2D]"
                  />
                </div>
              )}

              {(panel === "index" || panel === "search") && (
                <div className="flex flex-wrap gap-1.5 border-b border-border p-4">
                  <FilterChip active={catFilter === "Todas"} onClick={() => setCatFilter("Todas")}>
                    Todas
                  </FilterChip>
                  {categoriasMentais.map((c) => (
                    <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
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
                      body="Toque no coração de uma situação para salvar aqui."
                    />
                  ) : (
                    <ul className="space-y-2">
                      {situacoes
                        .filter((s) => state.favorites.includes(s.id))
                        .map((s) => (
                          <IndexItem
                            key={s.id}
                            s={s}
                            active={s.id === current.id}
                            onClick={() => {
                              const idx = situacoes.findIndex((x) => x.id === s.id);
                              goToPage(idx, idx > page ? 1 : -1);
                            }}
                          />
                        ))}
                    </ul>
                  )
                ) : (
                  <ul className="space-y-2">
                    {filtered.map((s) => (
                      <IndexItem
                        key={s.id}
                        s={s}
                        active={s.id === current.id}
                        onClick={() => {
                          const idx = situacoes.findIndex((x) => x.id === s.id);
                          goToPage(idx, idx > page ? 1 : -1);
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
                Você leu {Math.round((state.visited.length / total) * 100)}% do livro
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Premium conversion screen */}
      <AnimatePresence>
        {showConversionScreen && (
          <PremiumConversionScreen
            productId={productId}
            onDismiss={() => setShowConversionScreen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:bg-accent"
    >
      {children}
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-[#FF4D2D] text-white"
          : "border border-border bg-card text-muted-foreground hover:border-[#FF4D2D]/50"
      }`}
    >
      {children}
    </button>
  );
}

function IndexItem({
  s,
  active,
  onClick,
}: {
  s: { id: number; titulo: string; categoria: string };
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition hover:border-[#FF4D2D]/40 ${
          active ? "border-[#FF4D2D]/60 bg-[#FF4D2D]/10" : "border-border bg-card"
        }`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {String(s.id).padStart(2, "0")} · {s.categoria}
        </p>
        <p className="mt-0.5 font-semibold text-foreground">{s.titulo}</p>
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
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
      {icon}
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm">{body}</p>
    </div>
  );
}

function CoverStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-[#ffb4a5]">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
