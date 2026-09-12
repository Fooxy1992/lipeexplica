"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { BookOpen, Clock, Sparkles } from "lucide-react";

interface Props {
  count: number;
  minutes: number;
  onOpen: () => void;
}

/** Capa do livro — visual lipeexplica (dark + brand-red), com arte gerada. */
export function BookCover({ count, minutes, onOpen }: Props) {
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <div className="grid-bg relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131313] px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#FF4D2D]/12 blur-3xl"
      />

      <div className="relative grid w-full max-w-6xl items-center gap-14 md:grid-cols-2">
        {/* Capa 3D */}
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
              style={{
                background: "linear-gradient(90deg, #000, transparent)",
                transform: "translateZ(-6px)",
              }}
            />
            <div className="absolute inset-0 overflow-hidden rounded-r-2xl rounded-l-md border border-[#FF4D2D]/25 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
              {!coverFailed ? (
                <Image
                  src="/book/capa.webp"
                  alt="Capa: 50 Dinâmicas para Jiu-Jitsu Infantil"
                  fill
                  priority
                  sizes="340px"
                  className="object-cover"
                  onError={() => setCoverFailed(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a1512] via-[#1c1b1b] to-[#131313]" />
              )}
              {/* overlay de título */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(19,19,19,0.55) 0%, transparent 35%, transparent 55%, rgba(19,19,19,0.85) 100%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-7 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffb4a5]">
                  lipeexplica
                </p>
                <div className="mt-auto">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                    50 Dinâmicas
                  </p>
                  <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                    Jiu-Jitsu <span className="text-[#FF4D2D]">Infantil</span>
                  </h1>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                    Como transformar suas aulas em experiências inesquecíveis
                  </p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/40">
                    OSS 🥋
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Coluna de info */}
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
            Um livro pensado para{" "}
            <span className="text-[#FF4D2D]">professores</span> que transformam
            vidas.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a1a1aa]">
            50 dinâmicas práticas com ilustração exclusiva, cronômetro embutido
            e checklist de aplicação. Organizadas por categoria, com objetivo,
            idade e passo a passo — pronto pra beira do tatame.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
            <Stat icon={<BookOpen className="h-4 w-4" />} label="Dinâmicas" value={String(count)} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Leitura" value={`~${minutes} min`} />
          </div>

          <motion.button
            onClick={onOpen}
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

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
