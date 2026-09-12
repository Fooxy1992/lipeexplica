import Link from "next/link";
import { BookOpen, Clock, Sparkles } from "lucide-react";
import type { LibraryItem } from "@/core/application/use-cases/get-user-library";
import { formatDate } from "@/lib/utils";

export function LibraryCard({ item }: { item: LibraryItem }) {
  const { product, progressPct, lastAccessedAt } = item;
  const started = progressPct > 0;

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E4EAF4] transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Cover strip */}
      <div
        className="relative flex h-36 items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1C1E2E 0%, #2a1a16 60%, #3d1a0f 100%)",
        }}
      >
        <AccessTypeBadge type={item.accessType} />
        <div
          className="rounded-xl px-5 py-3 text-center"
          style={{ border: "1px solid rgba(255,77,45,0.35)" }}
        >
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/50">
            {product.type === "ebook" ? "Livro interativo" : product.type}
          </p>
          <p
            className="mt-1 font-display text-lg font-semibold leading-tight"
            style={{ color: "#ff9e7a" }}
          >
            {product.title}
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-[#8B92A8]">
          {product.description}
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-[#8B92A8]">
            <span>Progresso</span>
            <span className="font-semibold text-[#1C1E2E]">{progressPct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EEF2FA]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #FF4D2D, #ff7a5c)",
              }}
            />
          </div>
        </div>

        <div className="mt-3">
          {lastAccessedAt ? (
            <p className="flex items-center gap-1.5 text-[11px] text-[#8B92A8]">
              <Clock className="h-3 w-3" />
              Último acesso: {formatDate(lastAccessedAt)}
            </p>
          ) : (
            <p className="text-[11px] text-[#B0B8CC]">Nunca aberto</p>
          )}
        </div>

        <Link
          href={`/books/${product.slug}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D2D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20]"
        >
          <BookOpen className="h-4 w-4" />
          {item.accessType === "preview"
            ? "Explorar Preview"
            : started
            ? "Continuar Leitura"
            : "Abrir"}
        </Link>

        {item.accessType === "preview" && (
          <Link
            href="/50dinamicas#comprar"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#FF4D2D]/25 py-2 text-[11px] font-medium text-[#FF4D2D] transition hover:bg-[#FF4D2D]/8"
          >
            <Sparkles className="h-3 w-3" /> Desbloquear acesso completo
          </Link>
        )}
      </div>
    </div>
  );
}

function AccessTypeBadge({ type }: { type: "premium" | "preview" | "admin" }) {
  const configs = {
    premium: { label: "Premium", bg: "#FF4D2D", color: "#fff" },
    preview: { label: "Preview", bg: "rgba(255,77,45,0.15)", color: "#FF4D2D" },
    admin:   { label: "Admin",   bg: "#f59e0b", color: "#fff" },
  };
  const c = configs[type];
  return (
    <span
      className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
