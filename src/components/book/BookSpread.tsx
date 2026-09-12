import { motion, AnimatePresence } from "motion/react";
import type { Dinamica } from "@/types/book";
import { BookPage } from "./BookPage";

interface Props {
  dinamica: Dinamica;
  index: number;
  total: number;
  direction: 1 | -1;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function BookSpread({
  dinamica,
  index,
  total,
  direction,
  isFavorite,
  onToggleFavorite,
}: Props) {
  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: "2400px" }}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={dinamica.id}
          custom={direction}
          initial={{
            rotateY: direction === 1 ? -90 : 90,
            opacity: 0.4,
            transformOrigin: direction === 1 ? "left center" : "right center",
            boxShadow: "0 0 40px rgba(0,0,0,0.25)",
          }}
          animate={{
            rotateY: 0,
            opacity: 1,
            transformOrigin: direction === 1 ? "left center" : "right center",
          }}
          exit={{
            rotateY: direction === 1 ? 90 : -90,
            opacity: 0.3,
            transformOrigin: direction === 1 ? "right center" : "left center",
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
        >
          <BookPage
            dinamica={dinamica}
            index={index}
            total={total}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
          {/* page-turn shadow overlay */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                direction === 1
                  ? "linear-gradient(90deg, rgba(0,0,0,0.35), transparent 30%)"
                  : "linear-gradient(270deg, rgba(0,0,0,0.35), transparent 30%)",
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
