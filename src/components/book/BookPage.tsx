"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Clock,
  Target,
  Users,
  Package,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { Dinamica } from "@/types/book";
import { BookImage } from "./BookImage";
import { DinamicaTimer } from "./DinamicaTimer";

interface Props {
  dinamica: Dinamica;
  index: number;
  total: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const CHECK_KEY = "lipeexplica-book-checklist-v1";

/** Checklist local (por dispositivo) dos passos executados na aula. */
function useChecklist(dinamicaId: number) {
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(CHECK_KEY) ?? "{}");
      setChecked(Array.isArray(all[dinamicaId]) ? all[dinamicaId] : []);
    } catch {
      setChecked([]);
    }
  }, [dinamicaId]);

  const toggle = (step: number) => {
    setChecked((prev) => {
      const next = prev.includes(step)
        ? prev.filter((s) => s !== step)
        : [...prev, step];
      try {
        const all = JSON.parse(localStorage.getItem(CHECK_KEY) ?? "{}");
        all[dinamicaId] = next;
        localStorage.setItem(CHECK_KEY, JSON.stringify(all));
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  return { checked, toggle };
}

export function BookPage({ dinamica, index, total, isFavorite, onToggleFavorite }: Props) {
  const pct = ((index + 1) / total) * 100;
  const { checked, toggle } = useChecklist(dinamica.id);
  const allDone = checked.length >= dinamica.passos.length;

  return (
    <div className="page-paper relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-book)]">
      <div className="book-scroll flex flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin]">
        {/* Ilustração gerada (Gemini) */}
        <div className="relative shrink-0">
          <BookImage
            dinamicaId={dinamica.id}
            categoria={dinamica.categoria}
            titulo={dinamica.titulo}
            className="h-32 w-full sm:h-52"
          />
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:scale-105"
          >
            <Heart
              className={`h-5 w-5 transition ${
                isFavorite ? "fill-[#FF4D2D] text-[#FF4D2D]" : "text-white/80"
              }`}
            />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffb4a5]">
              Dinâmica {String(dinamica.id).padStart(2, "0")} · {dinamica.categoria}
            </p>
            <h2 className="mt-0.5 text-xl font-black leading-tight text-white drop-shadow sm:text-3xl">
              {dinamica.titulo}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 pb-3 pt-3 sm:gap-5 sm:px-7 sm:pb-4 sm:pt-5">
          <div className="grid grid-cols-3 gap-1.5 text-[11px] sm:gap-2">
            <Meta icon={<Users className="h-3.5 w-3.5" />} label="Idade" value={dinamica.idade} />
            <Meta icon={<Clock className="h-3.5 w-3.5" />} label="Tempo" value={dinamica.tempo} />
            <Meta icon={<Package className="h-3.5 w-3.5" />} label="Material" value={dinamica.materiais} />
          </div>

          <section>
            <SectionTitle icon={<Target className="h-4 w-4" />}>Objetivo</SectionTitle>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">
              {dinamica.objetivo}
            </p>
          </section>

          <DinamicaTimer tempo={dinamica.tempo} dinamicaId={dinamica.id} />

          <section>
            <div className="flex items-center justify-between">
              <SectionTitle>Como fazer</SectionTitle>
              {allDone ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aplicada!
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  {checked.length}/{dinamica.passos.length}
                </span>
              )}
            </div>
            <ol className="mt-2 space-y-2">
              {dinamica.passos.map((p, i) => {
                const done = checked.includes(i);
                return (
                  <li key={i}>
                    <button
                      onClick={() => toggle(i)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm leading-relaxed transition ${
                        done
                          ? "border-[#FF4D2D]/40 bg-[#FF4D2D]/10 text-foreground/60"
                          : "border-border bg-card/50 text-foreground/85 hover:border-[#FF4D2D]/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold transition ${
                          done ? "bg-[#FF4D2D] text-white" : "bg-[#FF4D2D]/15 text-[#FF4D2D]"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={done ? "line-through decoration-[#FF4D2D]/50" : ""}>
                        {p}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          {dinamica.variacoes && (
            <section>
              <SectionTitle>Variações</SectionTitle>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                {dinamica.variacoes}
              </p>
            </section>
          )}

          {dinamica.dica && (
            <section className="rounded-xl border border-[#ffbc7c]/30 bg-[#ffbc7c]/10 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#ffbc7c]">
                <Lightbulb className="h-3.5 w-3.5" />
                Dica do Professor
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{dinamica.dica}</p>
            </section>
          )}
        </div>
      </div>

      {/* footer */}
      <footer className="border-t border-border px-6 py-3 sm:px-8">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Página {index + 1} de {total}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #FF4D2D, #ffbc7c)",
            }}
          />
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {icon}
      {children}
    </h3>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-foreground sm:text-[12px]">
        {value}
      </p>
    </div>
  );
}
