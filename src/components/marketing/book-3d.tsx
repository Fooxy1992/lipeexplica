"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";

export function Book3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 8]), { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex justify-center"
      style={{ perspective: "1400px" }}
    >
      {/* Float animation wrapper */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* 3D tilt wrapper */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Main cover */}
          <div
            className="relative w-[260px] sm:w-[340px] md:w-[380px]"
            style={{ aspectRatio: "3/4" }}
          >
            {/* Spine */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-4 origin-left rounded-l-lg"
              style={{
                background: "linear-gradient(90deg, #000 0%, #1a1a1a 40%, transparent 100%)",
                transform: "rotateY(-90deg) translateZ(-2px) translateX(-100%)",
                transformOrigin: "left",
              }}
            />

            {/* Cover face */}
            <div className="absolute inset-0 overflow-hidden rounded-r-2xl rounded-l-md border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)]">
              <Image
                src="/book/capa.webp"
                alt="50 Dinâmicas para Jiu-Jitsu Infantil"
                fill
                priority
                sizes="(max-width: 640px) 260px, (max-width: 768px) 340px, 380px"
                className="object-cover"
              />

              {/* Overlay */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(9,9,11,0.4) 0%, transparent 30%, transparent 55%, rgba(9,9,11,0.75) 100%)",
                }}
              />

              {/* Shine */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 65%)",
                }}
              />

              {/* Text overlay */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-8 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/50">
                  50 Dinâmicas
                </p>
                <h2 className="mt-1.5 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
                  Jiu-Jitsu <span className="text-[#ef4444]">Infantil</span>
                </h2>
                <p className="mt-2 text-[11px] uppercase tracking-[0.4em] text-white/30">
                  lipeexplica
                </p>
              </div>
            </div>

            {/* Page stack edge */}
            <div
              aria-hidden
              className="absolute inset-y-2 -right-2 w-2.5 rounded-r-sm"
              style={{
                background:
                  "repeating-linear-gradient(0deg,#1e1e20,#1e1e20 1.5px,#2a2a2d 2.5px)",
              }}
            />
          </div>

          {/* Reflection */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-0 right-0 h-20 opacity-25"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
              transform: "scaleY(-1)",
              maskImage: "linear-gradient(180deg, black 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 100%)",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
