"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Sticky bottom bar on mobile. Two-tier plans means we can't pick one here,
 * so it scrolls the visitor to the pricing section instead of starting a
 * checkout for an unchosen plan.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-white/8 bg-[#09090b]/90 px-4 py-3 backdrop-blur-xl md:hidden"
        >
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-white/50 uppercase tracking-wide">50 Dinâmicas BJJ</p>
            <p className="text-xs text-white/40">a partir de R$14,90/mês</p>
          </div>
          <a
            href="#comprar"
            className="inline-flex h-11 shrink-0 items-center rounded-2xl bg-[#facc15] px-6 text-sm font-black uppercase tracking-wide text-[#09090b] shadow-[0_0_24px_rgba(250,204,21,0.4)] hover:brightness-110"
          >
            Ver planos
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
