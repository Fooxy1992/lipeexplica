"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Botão de copiar link (usado na lista de convites). */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard bloqueado */
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
        copied
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
          : "border-border hover:bg-accent"
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado!" : "Copiar link"}
    </button>
  );
}
