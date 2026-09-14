'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';

export function DrawRaffleButton({ raffleId }: { raffleId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDraw() {
    if (!confirm('Sortear agora? Esta ação é irreversível.')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/raffle/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffle_id: raffleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erro ao sortear');
        return;
      }
      setResult(`Bilhete vencedor: #${data.winner_ticket_number}`);
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-700">
        <Trophy className="h-4 w-4" />
        {result}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDraw}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
      >
        <Trophy className="h-4 w-4" />
        {loading ? 'Sorteando…' : 'Sortear agora'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
