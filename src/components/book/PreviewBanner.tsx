'use client';

import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';

interface Props {
  productSlug: string;
  previewCount: number;
  totalCount: number;
}

export function PreviewBanner({ productSlug, previewCount, totalCount }: Props) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2 text-[11px] font-medium"
      style={{
        background: 'linear-gradient(90deg, rgba(255,77,45,0.12), rgba(255,77,45,0.06))',
        borderBottom: '1px solid rgba(255,77,45,0.2)',
      }}
    >
      <div className="flex items-center gap-2 text-[#ffb4a5]">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span>
          Modo preview — {previewCount} de {totalCount} dinâmicas disponíveis
        </span>
      </div>
      <Link
        href={`/${productSlug}#comprar`}
        className="flex shrink-0 items-center gap-1 rounded-full border border-[#FF4D2D]/40 bg-[#FF4D2D]/10 px-3 py-1 text-[#FF4D2D] transition hover:bg-[#FF4D2D]/20"
      >
        Desbloquear <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
