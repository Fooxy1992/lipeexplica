/** ReadingProgress — per user × product; drives "Continuar Leitura". */
export interface ReadingProgress {
  userId: string;
  productId: string;
  lastPage: number;
  totalPages: number;
  visited: number[];
  favorites: number[];
  completed: boolean;
  lastAccessedAt: string;
}

export function progressPercent(p: ReadingProgress | null): number {
  if (!p || p.totalPages === 0) return 0;
  return Math.min(100, Math.round((p.visited.length / p.totalPages) * 100));
}
