'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Star, Loader2 } from 'lucide-react';

interface Props {
  productId: string;
  onDismiss?: () => void;
}

type LoadingKey = 'essencial' | 'completo' | null;

export function PremiumConversionScreen({ productId, onDismiss }: Props) {
  const [loading, setLoading] = useState<LoadingKey>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planSlug: LoadingKey & string) {
    setLoading(planSlug);
    setError(null);
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, planSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao iniciar assinatura');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      setLoading(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(24px)', background: 'rgba(19,19,19,0.92)' }}
    >
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
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#FF4D2D]/25 bg-[#1a1a1a] p-6 shadow-[0_0_80px_rgba(255,77,45,0.15)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.15 }}
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #FF4D2D, #ff7a5c)' }}
        >
          <Sparkles className="h-6 w-6 text-white" />
        </motion.div>

        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FF4D2D]">
          Preview concluído 🥋
        </p>
        <h2 className="mt-2 text-center font-display text-xl font-black leading-tight text-white">
          Escolha seu plano para continuar
        </h2>

        {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

        <div className="mt-5 space-y-3">
          {/* Plano Completo — destacado */}
          <div className="rounded-2xl border border-[#FF4D2D]/30 bg-[#FF4D2D]/8 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[#FF4D2D]" />
                <span className="text-sm font-semibold text-white">Completo</span>
                <span className="rounded-full bg-[#facc15] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#09090b]">
                  Recomendado
                </span>
              </div>
              <span className="font-display text-lg font-black text-white">
                R$24,90<span className="text-xs font-normal text-white/50">/mês</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              50 dinâmicas + dinâmicas novas todo mês · cancele quando quiser
            </p>
            <button
              onClick={() => handleCheckout('completo')}
              disabled={loading !== null}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF4D2D, #ff7a5c)' }}
            >
              {loading === 'completo' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Assinar Completo — R$24,90/mês'
              )}
            </button>
          </div>

          {/* Plano Essencial */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-white/70" />
                <span className="text-sm font-semibold text-white">Essencial</span>
              </div>
              <span className="font-display text-lg font-black text-white">
                R$14,90<span className="text-xs font-normal text-white/50">/mês</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-white/50">As 50 dinâmicas completas · cancele quando quiser</p>
            <button
              onClick={() => handleCheckout('essencial')}
              disabled={loading !== null}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {loading === 'essencial' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Assinar Essencial — R$14,90/mês'
              )}
            </button>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-4 w-full py-2 text-center text-sm text-white/30 transition hover:text-white/50"
          >
            Voltar ao preview
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
