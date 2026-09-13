import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { CategoryCard } from "@/components/content/category-card";
import { SectionHeader } from "@/components/ui/section-header";
import { categorias, getCategoria, trilhas } from "@/data/categorias";

export const metadata: Metadata = {
  title: "Aprender Jiu-Jitsu",
  description:
    "As seis frentes do Jiu-Jitsu explicadas sem enrolação: técnicas, mentalidade, história, sistema de faixas, competições e defesa pessoal.",
  alternates: { canonical: "/aprender" },
};

export default function AprenderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Aprender"
        title="O que você quer aprender?"
        subtitle="Escolha uma frente e vá fundo. Cada categoria reúne os artigos, termos e vídeos que existem sobre o assunto — e diz com clareza quando ainda não existe nada."
      />

      <section
        aria-labelledby="categorias-titulo"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <h2 id="categorias-titulo" className="sr-only">
          Categorias
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <li key={categoria.slug} className="flex">
              <CategoryCard categoria={categoria} className="w-full" />
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="trilhas-titulo"
        className="border-t border-border"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeader
            id="trilhas-titulo"
            eyebrow="Comece por aqui"
            title="Não sabe por onde começar?"
            description="Três pontos de partida, dependendo de onde você está hoje."
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
                  className="flex flex-col rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="text-h3 text-foreground">{trilha.titulo}</h3>
                  <p className="mt-2 flex-1 text-body text-muted-foreground">
                    {trilha.descricao}
                  </p>

                  <ol className="mt-5 flex flex-wrap gap-2">
                    {destinos.map((categoria, index) => (
                      <li key={categoria.slug} className="flex items-center gap-2">
                        {index > 0 ? (
                          <span aria-hidden className="text-muted-foreground">
                            ·
                          </span>
                        ) : null}
                        <Link
                          href={`/aprender/${categoria.slug}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-border px-3.5 text-small text-muted-foreground transition-colors hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)] hover:text-foreground"
                        >
                          {categoria.nome}
                        </Link>
                      </li>
                    ))}
                  </ol>

                  <Link
                    href={`/aprender/${primeira.slug}`}
                    className="group mt-6 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-[var(--brand)]"
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
    </>
  );
}
