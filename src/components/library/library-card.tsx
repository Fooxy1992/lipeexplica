import Link from "next/link";
import { BookOpen, Clock, Sparkles } from "lucide-react";
import type { LibraryItem } from "@/core/application/use-cases/get-user-library";
import { formatDate } from "@/lib/utils";

/** One owned product in the library, with progress + continue CTA. */
export function LibraryCard({ item }: { item: LibraryItem }) {
  const { product, progressPct, lastAccessedAt } = item;
  const started = progressPct > 0;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-[var(--royal)]/50 hover:shadow-md">
      {/* mini cover strip */}
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-[oklch(0.22_0.05_265)] to-[oklch(0.14_0.03_260)]">
        <AccessTypeBadge type={item.accessType} />
        <div className="rounded-lg border border-[color-mix(in_oklab,var(--gold)_50%,transparent)] px-5 py-3 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/60">
            {product.type === "ebook" ? "Livro interativo" : product.type}
          </p>
          <p className="gold-text mt-1 font-display text-lg font-semibold leading-tight">
            {product.title}
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {/* progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progresso</span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--royal), var(--gold))",
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {lastAccessedAt ? (
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Último acesso: {formatDate(lastAccessedAt)}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Nunca aberto</p>
          )}
        </div>

        <Link
          href={`/books/${product.slug}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--royal)] px-5 py-3 text-sm font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
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
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#FF4D2D]/30 py-2 text-[11px] font-medium text-[#FF4D2D] transition hover:bg-[#FF4D2D]/10"
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
    premium: {
      label: "Premium",
      style: { background: "linear-gradient(135deg, #FF4D2D, #ff7a5c)" },
    },
    preview: {
      label: "Preview",
      style: {
        background: "rgba(255,77,45,0.15)",
        color: "#FF4D2D",
        border: "1px solid rgba(255,77,45,0.3)",
      },
    },
    admin: {
      label: "Admin",
      style: {
        background: "var(--gold)",
        color: "var(--gold-foreground)",
      },
    },
  };
  const c = configs[type];
  return (
    <span
      className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
      style={c.style}
    >
      {c.label}
    </span>
  );
}
