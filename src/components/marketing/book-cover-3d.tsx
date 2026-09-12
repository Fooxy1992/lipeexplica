"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

/** 3D book cover with the Gemini-generated illustration — same design as the book reader. */
export function BookCover3D() {
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <div className="mx-auto flex justify-center" style={{ perspective: "1800px" }}>
      <motion.div
        initial={{ rotateY: 20, rotateX: 8, y: 40, opacity: 0 }}
        animate={{ rotateY: -18, rotateX: 6, y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ rotateY: -12, rotateX: 4, transition: { duration: 0.4 } }}
        className="relative aspect-[3/4] w-[260px] sm:w-[320px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Spine */}
        <div
          aria-hidden
          className="absolute inset-y-0 -left-1 w-3 rounded-l-md"
          style={{
            background: "linear-gradient(90deg, #000, transparent)",
            transform: "translateZ(-6px)",
          }}
        />
        {/* Pages */}
        <div
          aria-hidden
          className="absolute inset-y-2 -right-2 w-2 rounded-r-sm"
          style={{
            background: "repeating-linear-gradient(0deg, #f0ede8, #f0ede8 2px, #d4cfc8 3px)",
            transform: "translateZ(-2px)",
          }}
        />

        {/* Cover */}
        <div className="absolute inset-0 overflow-hidden rounded-r-2xl rounded-l-md border border-[#FF4D2D]/25 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
          {!coverFailed ? (
            <Image
              src="/book/capa.webp"
              alt="Capa: 50 Dinâmicas para Jiu-Jitsu Infantil"
              fill
              priority
              sizes="(max-width: 640px) 260px, 320px"
              className="object-cover"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a1512] via-[#1c1b1b] to-[#131313]" />
          )}

          {/* gradient overlay */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(19,19,19,0.55) 0%, transparent 35%, transparent 55%, rgba(19,19,19,0.85) 100%)",
            }}
          />

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-7 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffb4a5]">
              lipeexplica
            </p>
            <div className="mt-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                50 Dinâmicas
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                Jiu-Jitsu <span className="text-[#FF4D2D]">Infantil</span>
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                Como transformar suas aulas em experiências inesquecíveis
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/40">
                OSS 🥋
              </p>
            </div>
          </div>

          {/* Shine */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0) 65%)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
