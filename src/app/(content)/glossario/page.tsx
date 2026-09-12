import type { Metadata } from "next";
import Link from "next/link";
import { termos, categoriasGlossario } from "@/data/glossario";
import { PageHeader } from "@/components/content/page-header";

export const metadata: Metadata = {
  title: "Glossário de Jiu-Jitsu",
  description:
    "Todos os termos que você precisa conhecer no tatame, explicados de forma clara e direta.",
};

export default function GlossarioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Referência"
        title="Glossário de Jiu-Jitsu"
        subtitle="Todos os termos que você precisa conhecer no tatame, explicados de forma clara e direta."
      />
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex flex-wrap gap-2">
          {categoriasGlossario.map((c) => (
            <a
              key={c}
              href={`#${c.toLowerCase()}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition hover:border-[var(--royal)] hover:text-foreground"
            >
              {c}
            </a>
          ))}
        </div>

        {categoriasGlossario.map((categoria) => {
          const items = termos.filter((t) => t.categoria === categoria);
          if (items.length === 0) return null;
          return (
            <div key={categoria} id={categoria.toLowerCase()} className="mt-12 scroll-mt-24">
              <h2 className="font-display text-2xl font-semibold">
                {categoria}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/glossario/${t.slug}`}
                    className="rounded-xl border border-border bg-card p-5 transition hover:border-[var(--royal)]/50 hover:shadow-sm"
                  >
                    <h3 className="font-display text-lg font-semibold">{t.nome}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {t.descricao}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
