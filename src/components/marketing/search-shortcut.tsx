"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Só o atalho fica no bundle de todas as páginas.
 * O painel — e com ele o índice de busca — é importado na primeira abertura,
 * então a Home não paga por uma funcionalidade que a maioria não usa.
 */
const CommandPalette = dynamic(() => import("./command-palette"), {
  ssr: false,
});

export function SearchShortcut() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;
  return <CommandPalette onClose={() => setOpen(false)} />;
}
