import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { getCategoria, trilhas } from "@/data/categorias";

/**
 * "Comece por aqui" — três pontos de partida.
 * Cada trilha aponta para categorias que existem de verdade; se um slug não
 * resolver, a trilha simplesmente não é renderizada em vez de gerar link morto.
 */
export function ComeceAquiSection() {
  return (
    <section
      aria-labelledby="home-comece"
      className="border-y border-border bg-[color-mix(in_oklab,var(--surface-1)_55%,transparent)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          id="home-comece"
          eyebrow="Comece por aqui"
          title="Onde você está hoje?"
          description="Três caminhos de entrada, dependendo do seu momento no tatame."
        />

        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {trilhas.map((trilha) => {
            const destinos = trilha.categorias
              .map((slug) => getCategoria(slug))
              .filter((c) => c !== undefined);
            const primeira = destinos[0];
            if (!primeira) return null;

            return (
              <li
                key={trilha.slug}
                className="group flex flex-col rounded-2xl border border-border bg-[var(--background)] p-6 transition-[border-color] duration-200 hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)]"
              >
                <h3 className="text-h3 text-foreground">{trilha.titulo}</h3>

                <p className="mt-2 flex-1 text-body text-muted-foreground">
                  {trilha.descricao}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {destinos.map((categoria) => (
                    <li key={categoria.slug}>
                      <Link
                        href={`/aprender/${categoria.slug}`}
                        className="inline-flex min-h-11 items-center rounded-full border border-border px-3.5 text-small text-muted-foreground transition-colors hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] hover:text-foreground"
                      >
                        {categoria.nome}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/aprender/${primeira.slug}`}
                  className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-[var(--brand)]"
                >
                  Começar por {primeira.nome}
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
