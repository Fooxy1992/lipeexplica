'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Gift } from 'lucide-react';

export function AcaoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('acao_popup_seen')) return;
    } catch { /* private mode */ }
    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setOpen(false);
    try { sessionStorage.setItem('acao_popup_seen', '1'); } catch { /* ignore */ }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Ação"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-[#121314] text-white shadow-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #ff4b2b, transparent 70%)' }}
        />

        <button
          onClick={close}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 hover:text-white/80 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ff4b2b]/10">
            <Gift className="h-7 w-7 text-[#ff4b2b]" />
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold leading-tight">
            Ganhe um Kimono Completo
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Participa da nossa ação e concorre a um kimono completo. A partir de{' '}
            <strong className="text-white">R$ 15</strong> por ação.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/acao"
              onClick={close}
              className="block w-full rounded-full bg-[#ff4b2b] py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Ver a ação
            </Link>
            <button
              onClick={close}
              className="block w-full text-xs text-white/30 hover:text-white/50 transition"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
