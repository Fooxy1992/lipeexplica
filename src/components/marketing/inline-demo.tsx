"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Lock, ChevronRight, ChevronLeft, Clock, Users, Package, Target, Lightbulb, Check } from "lucide-react";
import { dinamicas } from "@/data/dinamicas";

const PREVIEW_PAGES = dinamicas.slice(0, 2);

interface InlineDemoProps {
  productId: string;
  onBuy: () => void;
}

export function InlineDemo({ productId, onBuy }: InlineDemoProps) {
  const [page, setPage] = useState(0); // 0, 1 = content; 2 = gate
  const total = PREVIEW_PAGES.length;
  const isGate = page >= total;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dinamica = PREVIEW_PAGES[Math.min(page, total - 1)]!;

  return (
    /* Device frame — tablet mockup */
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* Outer bezel */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] border border-white/8 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04)]"
        style={{ background: "#0d0d0f" }}
      >
        {/* Camera notch */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="h-1.5 w-10 rounded-full bg-white/10" />
        </div>

        {/* Screen area */}
        <div className="relative mx-3 mb-3 overflow-hidden rounded-[1.5rem] bg-[#111827]" style={{ minHeight: 560 }}>
          <AnimatePresence mode="wait">
            {!isGate ? (
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                {/* Illustration */}
                <div className="relative h-44 shrink-0">
                  <Image
                    src={`/book/dinamica-0${dinamica.id}.webp`}
                    alt={dinamica.titulo}
                    fill
                    className="object-cover"
                    sizes="420px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg,rgba(17,24,39,0.3) 0%,transparent 40%,rgba(17,24,39,0.9) 100%)" }}
                  />
                  <div className="absolute bottom-3 left-4 right-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ef4444]/80">
                      Dinâmica {String(dinamica.id).padStart(2,"0")} · {dinamica.categoria}
                    </p>
                    <h3 className="mt-0.5 text-2xl font-black leading-tight text-white">{dinamica.titulo}</h3>
                  </div>
                  {/* Page counter badge */}
                  <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white/70 backdrop-blur-sm">
                    {page + 1} / 50
                  </div>
                </div>

                <div className="flex flex-col gap-3 px-4 py-3">
                  {/* Meta */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <MetaChip icon={<Users className="h-3 w-3"/>} label="Idade" value={dinamica.idade}/>
                    <MetaChip icon={<Clock className="h-3 w-3"/>} label="Tempo" value={dinamica.tempo}/>
                    <MetaChip icon={<Package className="h-3 w-3"/>} label="Material" value={dinamica.materiais}/>
                  </div>

                  {/* Objetivo */}
                  <div>
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      <Target className="h-3 w-3"/> Objetivo
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">{dinamica.objetivo}</p>
                  </div>

                  {/* Passos */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Como fazer</p>
                    <ol className="mt-1.5 space-y-1.5">
                      {dinamica.passos.map((p, i) => (
                        <li key={i} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/3 px-3 py-2 text-sm text-white/75">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ef4444]/15 text-[10px] font-bold text-[#ef4444]">
                            {i + 1}
                          </span>
                          {p}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Dica */}
                  {dinamica.dica && (
                    <div className="rounded-xl border border-[#facc15]/15 bg-[#facc15]/5 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#facc15]/70">
                        <Lightbulb className="h-3 w-3"/> Dica do Professor
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/65">{dinamica.dica}</p>
                    </div>
                  )}
                </div>

                {/* Progress footer */}
                <div className="border-t border-white/5 px-4 py-2.5">
                  <div className="flex items-center justify-between text-[10px] text-white/25">
                    <span>Página {page + 1} de 50</span>
                    <span>{Math.round(((page + 1) / 50) * 100)}%</span>
                  </div>
                  <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${((page + 1) / 50) * 100}%`, background: "linear-gradient(90deg,#ef4444,#facc15)" }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              /* GATE */
              <motion.div
                key="gate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex min-h-[560px] flex-col"
              >
                {/* Blurred last page */}
                <div className="absolute inset-0 select-none" style={{ filter: "blur(8px)", opacity: 0.3, pointerEvents: "none" }}>
                  <div className="h-44 bg-gradient-to-b from-[#1f2937] to-[#111827]" />
                  <div className="space-y-2 p-4">
                    {[80, 60, 90, 70, 50].map((w, i) => (
                      <div key={i} className="h-3 rounded-full bg-white/20" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>

                {/* Gate overlay */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                    <Lock className="h-6 w-6 text-white/60" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-black text-white">
                      Final da demonstração
                    </p>
                    <p className="mt-2 text-sm text-white/50">Desbloqueie todas as 50 dinâmicas</p>
                  </div>
                  <div className="w-full space-y-2">
                    {[
                      "Todas as 50 dinâmicas completas",
                      "Atualizações semanais de conteúdo",
                      "Grupo exclusivo no WhatsApp",
                      "Acesso em qualquer dispositivo",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-2.5 text-sm text-white/70">
                        <Check className="h-4 w-4 shrink-0 text-[#ef4444]" />
                        {t}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onBuy}
                    className="w-full rounded-2xl bg-[#facc15] py-4 text-sm font-black uppercase tracking-wider text-[#09090b] shadow-[0_0_30px_rgba(250,204,21,0.3)] transition hover:brightness-110 active:scale-98"
                  >
                    Quero Desbloquear
                  </button>
                  <p className="text-[11px] text-white/25">Acesso imediato · 7 dias de garantia</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 pb-4 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/8 text-white/40 transition hover:border-white/20 hover:text-white disabled:opacity-20"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: page === i ? 20 : 6,
                  background: page === i ? "#ef4444" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            disabled={isGate}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/8 text-white/40 transition hover:border-white/20 hover:text-white disabled:opacity-20"
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Glow below device */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse, rgba(239,68,68,0.12), transparent 70%)" }}
      />
    </div>
  );
}

function MetaChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/3 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-white/30">
        {icon}{label}
      </div>
      <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-white/75">{value}</p>
    </div>
  );
}
