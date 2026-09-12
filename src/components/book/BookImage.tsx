"use client";

import { useState } from "react";
import Image from "next/image";
import { BookIllustration } from "./BookIllustration";
import type { Categoria } from "@/types/book";

/**
 * Ilustração gerada (Gemini) da dinâmica, com fallback para o SVG
 * ilustrado caso o arquivo não exista.
 */
export function BookImage({
  dinamicaId,
  categoria,
  titulo,
  className = "",
}: {
  dinamicaId: number;
  categoria: Categoria;
  titulo: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = `/book/dinamica-${String(dinamicaId).padStart(2, "0")}.webp`;

  if (failed) {
    return <BookIllustration categoria={categoria} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={`Ilustração: ${titulo}`}
        fill
        sizes="(max-width: 640px) 100vw, 560px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
      {/* vinheta para integrar com o tema escuro */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 60%, rgba(19,19,19,0.55) 100%)",
        }}
      />
    </div>
  );
}
