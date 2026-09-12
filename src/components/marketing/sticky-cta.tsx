"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BuyButton } from "./buy-button";
import type { Product } from "@/core/domain/entities/product";
import { formatPrice } from "@/lib/utils";

export function StickyCta({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const price = formatPrice(product.price, product.currency.toUpperCase());

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
            <p className="text-base font-black text-white">{price}</p>
          </div>
          <BuyButton
            productId={product.id}
            plan="book"
            label="Comprar agora"
            className="h-11 shrink-0 rounded-2xl bg-[#facc15] px-6 text-sm font-black uppercase tracking-wide text-[#09090b] shadow-[0_0_24px_rgba(250,204,21,0.4)] hover:brightness-110"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
