'use client';

import { useState, useTransition } from 'react';
import { togglePreviewPage } from './actions';

interface PageRow {
  pageIndex: number;
  previewEnabled: boolean;
}

export function BookPagesAdminForm({
  productId,
  pages,
}: {
  productId: string;
  pages: PageRow[];
}) {
  const [state, setState] = useState<Map<number, boolean>>(
    new Map(pages.map((p) => [p.pageIndex, p.previewEnabled])),
  );
  const [isPending, startTransition] = useTransition();

  function toggle(pageIndex: number) {
    const next = !state.get(pageIndex);
    setState((prev) => new Map(prev).set(pageIndex, next));
    startTransition(() => togglePreviewPage(productId, pageIndex, next));
  }

  return (
    <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
      {pages.map(({ pageIndex }) => {
        const enabled = state.get(pageIndex) ?? false;
        return (
          <button
            key={pageIndex}
            onClick={() => toggle(pageIndex)}
            disabled={isPending}
            title={`Dinâmica ${pageIndex + 1} — ${enabled ? 'Preview ON' : 'Bloqueada'}`}
            className="flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition"
            style={
              enabled
                ? {
                    borderColor: '#FF4D2D',
                    background: 'rgba(255,77,45,0.12)',
                    color: '#FF4D2D',
                  }
                : {
                    borderColor: 'var(--border)',
                    background: 'var(--card)',
                    color: 'var(--muted-foreground)',
                  }
            }
          >
            <span className="text-[11px] font-bold">{pageIndex + 1}</span>
            <span className="text-[9px] uppercase tracking-wide">
              {enabled ? 'Preview' : 'Locked'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
