import Link from "next/link";
import { Lock } from "lucide-react";

/** 403 screen shown when the user does not own the product. */
export function ForbiddenScreen({ slug }: { slug: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-border bg-card">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">
          Acesso restrito
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Este conteúdo é exclusivo para quem adquiriu o produto. Se você já
          comprou, confira se entrou com o mesmo email usado na compra.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/50dinamicas#comprar"
            className="rounded-full bg-[var(--royal)] px-6 py-3 text-sm font-semibold text-[var(--royal-foreground)] transition hover:opacity-90"
          >
            Quero comprar
          </Link>
          <Link
            href="/library"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-accent"
          >
            Minha biblioteca
          </Link>
        </div>
        <p className="mt-6 text-[11px] uppercase tracking-widest text-muted-foreground/60">
          Erro 403 · {slug}
        </p>
      </div>
    </div>
  );
}
