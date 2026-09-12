"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Clock, Users, Package, Target, Lightbulb } from "lucide-react";

const DINAMICA = {
  id: 1,
  categoria: "Aquecimento",
  titulo: "Rouba Faixa",
  idade: "4 a 10 anos",
  tempo: "10 minutos",
  objetivo: "Desenvolver velocidade, atenção e movimentação.",
  materiais: "Faixas de Jiu-Jitsu.",
  passos: [
    "Cada aluno coloca uma faixa presa atrás do kimono.",
    "Ao sinal do professor, todos tentam pegar a faixa dos colegas enquanto protegem a própria.",
    "Vence quem terminar com mais faixas.",
  ],
  dica: "Reforce a importância de manter a base durante toda a dinâmica.",
};

export function DynamicPreview() {
  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="mx-auto w-full max-w-sm"
    >
      {/* phone-like frame */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FF4D2D]/25 bg-[#161616] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,77,45,0.08)]">
        {/* "live" badge */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-[#FF4D2D]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Preview
        </div>

        {/* Illustration */}
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src="/book/dinamica-01.webp"
            alt="Dinâmica Rouba Faixa"
            fill
            sizes="400px"
            className="object-cover"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(19,19,19,0.35) 0%, transparent 40%, rgba(22,22,22,0.9) 100%)",
            }}
          />
          <div className="absolute bottom-3 left-4 right-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffb4a5]">
              Dinâmica 01 · {DINAMICA.categoria}
            </p>
            <h2 className="mt-0.5 text-2xl font-black leading-tight text-white drop-shadow">
              {DINAMICA.titulo}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 pb-5 pt-3">
          {/* Meta chips */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <Meta icon={<Users className="h-3 w-3" />} label="Idade" value={DINAMICA.idade} />
            <Meta icon={<Clock className="h-3 w-3" />} label="Tempo" value={DINAMICA.tempo} />
            <Meta icon={<Package className="h-3 w-3" />} label="Material" value={DINAMICA.materiais} />
          </div>

          {/* Objetivo */}
          <section>
            <SectionLabel icon={<Target className="h-3.5 w-3.5" />}>Objetivo</SectionLabel>
            <p className="mt-1 text-sm leading-relaxed text-white/80">{DINAMICA.objetivo}</p>
          </section>

          {/* Passos */}
          <section>
            <div className="flex items-center justify-between">
              <SectionLabel>Como fazer</SectionLabel>
              <span className="text-[11px] text-white/30">0/{DINAMICA.passos.length}</span>
            </div>
            <ol className="mt-2 space-y-1.5">
              {DINAMICA.passos.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-white/80"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FF4D2D]/15 text-[10px] font-bold text-[#FF4D2D]">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          </section>

          {/* Dica */}
          <div className="rounded-xl border border-[#ffbc7c]/25 bg-[#ffbc7c]/8 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#ffbc7c]">
              <Lightbulb className="h-3 w-3" />
              Dica do Professor
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/75">{DINAMICA.dica}</p>
          </div>
        </div>

        {/* footer progress bar */}
        <div className="border-t border-white/6 px-5 py-3">
          <div className="flex items-center justify-between text-[11px] text-white/30">
            <span>Página 1 de 50</span>
            <span>2%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full w-[2%] rounded-full"
              style={{ background: "linear-gradient(90deg, #FF4D2D, #ffbc7c)" }}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-white/25">
        + 49 dinâmicas completas dentro do livro
      </p>
    </motion.div>
  );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
      {icon}
      {children}
    </h3>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/4 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-white/35">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-white/80">
        {value}
      </p>
    </div>
  );
}
