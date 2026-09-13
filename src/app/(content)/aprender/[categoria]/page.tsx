import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard } from "@/components/content/content-card";
import { CategoryCard } from "@/components/content/category-card";
import { Breadcrumb, breadcrumbJsonLd } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import {
  categorias,
  getCategoria,
  getConteudoDaCategoria,
} from "@/data/categorias";

const BASE = "https://www.lipeexplica.com";

export function generateStaticParams() {
  return categorias.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) return {};

  return {
    title: `${categoria.nome} — Jiu-Jitsu`,
    description: categoria.descricao,
    alternates: { canonical: `/aprender/${categoria.slug}` },
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) notFound();

  const { posts, termos, reels, vazia } = getConteudoDaCategoria(categoria);

  const trilha = [
    { href: "/", label: "Home" },
    { href: "/aprender", label: "Aprender" },
    { href: `/aprender/${categoria.slug}`, label: categoria.nome },
  ];

  const outras = categorias.filter((c) => c.slug !== categoria.slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(trilha, BASE)),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumb items={trilha} />
      </div>

      <PageHeader
        eyebrow="Aprender"
        title={categoria.nome}
        subtitle={categoria.descricao}
      />

      <section
        aria-labelledby="conteudo-titulo"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <h2 id="conteudo-titulo" className="sr-only">
          Conteúdo de {categoria.nome}
        </h2>

        {vazia ? (
          <EmptyState
            icon={Sparkles}
            title="Ainda não publicamos nada aqui"
            description={`${categoria.nome} está na fila de produção. Prefiro deixar a categoria vazia a encher de conteúdo raso — quando sair, sai bem feito.`}
            actions={[
              { href: "/aprender", label: "Ver outras categorias", primary: true },
              { href: "/blog", label: "Ler o blog" },
            ]}
          />
        ) : (
          <div className="flex flex-col gap-12">
            {posts.length > 0 ? (
              <div>
                <h3 className="text-label text-muted-foreground">Artigos</h3>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <li key={post.slug} className="flex">
                      <ContentCard
                        href={`/blog/${post.slug}`}
                        kind="Artigo"
                        title={post.title}
                        description={post.description}
                        meta={post.readingTime}
                        className="w-full"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {termos.length > 0 ? (
              <div>
                <h3 className="text-label text-muted-foreground">
                  Termos do glossário
                </h3>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {termos.map((termo) => (
                    <li key={termo.slug} className="flex">
                      <ContentCard
                        href={`/glossario/${termo.slug}`}
                        kind={termo.categoria}
                        title={termo.nome}
                        description={termo.descricao}
                        className="w-full"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {reels.length > 0 ? (
              <div>
                <h3 className="text-label text-muted-foreground">
                  Vídeos no Instagram
                </h3>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {reels.map((reel) => (
                    <li key={reel.id} className="flex">
                      <ContentCard
                        href={reel.url}
                        kind="Reel"
                        title={reel.title}
                        meta={`${reel.views} visualizações`}
                        external
                        className="w-full"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section
        aria-labelledby="proximo-titulo"
        className="border-t border-border"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeader
            id="proximo-titulo"
            eyebrow="Continue"
            title="Próximos passos"
            action={{ href: "/aprender", label: "Todas as categorias" }}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outras.map((outra) => (
              <li key={outra.slug} className="flex">
                <CategoryCard categoria={outra} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
