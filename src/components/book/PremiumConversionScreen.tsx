'use client';

import { motion } from 'motion/react';
import { Lock, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props {
  productSlug: string;
  onDismiss?: () => void;
}

export function PremiumConversionScreen({ productSlug, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(24px)', background: 'rgba(19,19,19,0.92)' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(255,77,45,0.18) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280, delay: 0.05 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#FF4D2D]/25 bg-[#1a1a1a] p-8 text-center shadow-[0_0_80px_rgba(255,77,45,0.15)]"
      >
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.15 }}
          className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,77,45,0.2), rgba(255,77,45,0.08))',
            border: '1px solid rgba(255,77,45,0.3)',
          }}
        >
          <Lock className="h-7 w-7 text-[#FF4D2D]" />
        </motion.div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FF4D2D]">
          Conteúdo Premium
        </p>
        <h2 className="mt-3 font-display text-2xl font-black leading-tight text-white">
          Esta dinâmica não está no<br />
          <span className="text-[#FF4D2D]">modo preview</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Você está explorando as primeiras dinâmicas. Para acessar as 50 completas,
          assine ou compre o livro.
        </p>

        {/* Benefits */}
        <div className="mt-5 space-y-2 text-left">
          {[
            { icon: Star, text: '50 dinâmicas completas com passo a passo' },
            { icon: Zap, text: 'Cronômetro, favoritos e progresso sincronizado' },
            { icon: Sparkles, text: 'Acesso vitalício — uma vez, para sempre' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FF4D2D]/10">
                <Icon className="h-3.5 w-3.5 text-[#FF4D2D]" />
              </div>
              <span className="text-sm text-white/75">{text}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/${productSlug}#comprar`}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF4D2D, #ff7a5c)' }}
        >
          <Sparkles className="h-4 w-4" />
          Quero acesso completo
        </Link>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-3 w-full py-2 text-sm text-white/40 transition hover:text-white/70"
          >
            Voltar ao preview
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
