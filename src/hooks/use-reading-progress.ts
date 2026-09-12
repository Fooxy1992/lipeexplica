"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reading state for the interactive book.
 *
 * Server is the source of truth (hydrated via `initial`), local state is
 * optimistic and synced back to POST /api/progress with a debounce, so
 * progress follows the user across devices.
 */
export interface ReadingState {
  favorites: number[];
  lastPage: number;
  visited: number[];
  theme: "light" | "dark";
  completed: boolean;
}

export interface InitialProgress {
  lastPage: number;
  visited: number[];
  favorites: number[];
  completed: boolean;
}

const THEME_KEY = "lipeexplica-book-theme";
const SYNC_DEBOUNCE_MS = 1_500;

export function useReadingProgress(
  productId: string,
  totalPages: number,
  initial: InitialProgress | null,
) {
  const [state, setState] = useState<ReadingState>({
    favorites: initial?.favorites ?? [],
    lastPage: initial?.lastPage ?? 0,
    visited: initial?.visited ?? [],
    completed: initial?.completed ?? false,
    theme: "light",
  });
  const [hydrated, setHydrated] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // theme preference is device-local
  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light")
        setState((s) => ({ ...s, theme: t }));
    } catch {
      /* private mode */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, state.theme);
    } catch {
      /* private mode */
    }
  }, [state.theme, hydrated]);

  const scheduleSync = useCallback(
    (next: ReadingState) => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        void fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            lastPage: next.lastPage,
            totalPages,
            visited: next.visited,
            favorites: next.favorites,
          }),
          keepalive: true,
        }).catch(() => {
          /* offline is fine — next sync wins */
        });
      }, SYNC_DEBOUNCE_MS);
    },
    [productId, totalPages],
  );

  useEffect(() => {
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, []);

  const toggleFavorite = useCallback(
    (id: number) => {
      setState((s) => {
        const next = {
          ...s,
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        };
        scheduleSync(next);
        return next;
      });
    },
    [scheduleSync],
  );

  const setLastPage = useCallback(
    (page: number, total: number) => {
      setState((s) => {
        const visited = s.visited.includes(page)
          ? s.visited
          : [...s.visited, page];
        const next = {
          ...s,
          lastPage: page,
          visited,
          completed: visited.length >= total,
        };
        scheduleSync(next);
        return next;
      });
    },
    [scheduleSync],
  );

  const toggleTheme = useCallback(() => {
    setState((s) => ({
      ...s,
      theme: s.theme === "dark" ? "light" : "dark",
    }));
  }, []);

  return { state, hydrated, toggleFavorite, setLastPage, toggleTheme };
}
