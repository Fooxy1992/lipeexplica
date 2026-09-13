"use client";

import { Heart, Brain, Lightbulb, CheckCircle2, Quote } from "lucide-react";
import type { Situacao } from "@/data/mental";

const CATEGORIA_COLOR: Record<string, string> = {
  Ansiedade: "#818cf8",
  Ego: "#f59e0b",
  "Frustração": "#f87171",
  "Constância": "#34d399",
  "Competição": "#60a5fa",
  "Evolução": "#a78bfa",
};

interface Props {
  situacao: Situacao;
  index: number;
  total: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function MentalPage({ situacao, index, total, isFavorite, onToggleFavorite }: Props) {
  const accentColor = CATEGORIA_COLOR[situacao.categoria] ?? "#FF4D2D";

  return (
    <div className="page-paper relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-book)]">
      {/* Header */}
      <div
        className="relative shrink-0 px-5 pt-5 pb-4"
        style={{
          background: `linear-gradient(135deg, rgba(8,9,10,0.98) 0%, color-mix(in oklab, ${accentColor} 12%, #0d0e0f) 100%)`,
        }}
      >
        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-t-2xl"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 50% -10%, color-mix(in oklab, ${accentColor} 20%, transparent) 0%, transparent 70%)`,
          }}
        />

        {/* Favorite button */}
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={isFavorite}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:scale-105"
        >
          <Heart
            className={`h-4 w-4 transition ${isFavorite ? "fill-[#FF4D2D] text-[#FF4D2D]" : "text-white/70"}`}
          />
        </button>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ color: accentColor }}
        >
          Situação {String(situacao.id).padStart(2, "0")} · {situacao.categoria}
        </p>
        <h2 className="mt-1.5 text-xl font-black leading-tight text-white sm:text-2xl">
          {situacao.titulo}
        </h2>

        {/* Progress pill */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%`, background: accentColor }}
            />
          </div>
          <span className="text-[9px] font-semibold tabular-nums text-white/40">
            {index + 1}/{total}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="book-scroll flex-1 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin]">
        <div className="flex flex-col gap-4 px-5 pb-6 pt-4 sm:px-7">

          {/* Situação */}
          <Section
            icon={<Brain className="h-4 w-4" />}
            label="A situação"
            accentColor={accentColor}
          >
            <p className="text-sm leading-relaxed text-foreground/90">{situacao.situacao}</p>
          </Section>

          {/* O que pensamos */}
          <Section
            icon={<Quote className="h-4 w-4" />}
            label="O que pensamos"
            accentColor="#f87171"
            faded
          >
            <p className="text-sm italic leading-relaxed text-foreground/75">
              &ldquo;{situacao.oquepensamos}&rdquo;
            </p>
          </Section>

          {/* Realidade */}
          <Section
            icon={<Lightbulb className="h-4 w-4" />}
            label="A realidade"
            accentColor="#34d399"
          >
            <p className="text-sm leading-relaxed text-foreground/90">{situacao.realidade}</p>
          </Section>

          {/* Ação */}
          <Section
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="O que fazer"
            accentColor={accentColor}
          >
            <p className="text-sm leading-relaxed text-foreground/90">{situacao.acao}</p>
          </Section>

          {/* Frase âncora */}
          <div
            className="relative overflow-hidden rounded-xl px-5 py-4"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklab, ${accentColor} 8%, transparent), color-mix(in oklab, ${accentColor} 4%, transparent))`,
              border: `1px solid color-mix(in oklab, ${accentColor} 25%, transparent)`,
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.3em]"
              style={{ color: accentColor }}
            >
              Frase para o tatame
            </p>
            <p className="mt-2 text-base font-black leading-snug text-foreground sm:text-lg">
              &ldquo;{situacao.frase}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  label,
  accentColor,
  faded,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  accentColor: string;
  faded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: `color-mix(in oklab, ${accentColor} ${faded ? "12%" : "20%"}, transparent)`,
        background: `color-mix(in oklab, ${accentColor} ${faded ? "3%" : "5%"}, transparent)`,
      }}
    >
      <div className="mb-2 flex items-center gap-2" style={{ color: accentColor }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.28em]">{label}</span>
      </div>
      {children}
    </div>
  );
}
