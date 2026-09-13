import type { Metadata } from "next";
import { posts } from "@/data/blog";
import { PageHeader } from "@/components/content/page-header";
import { PostCard } from "@/components/content/post-card";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Conteúdos",
  description:
    "Artigos sobre Jiu-Jitsu: técnicas, mentalidade, evolução e tudo sobre a arte suave.",
  alternates: { canonical: "/blog" },
};

const CATEGORIAS = ["Faixas", "Mentalidade", "Curiosidades", "Infantil"] as const;

/** O filtro vive na URL (?categoria=) — continua funcionando sem JS. */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const ativa = CATEGORIAS.find(
    (c) => c.toLowerCase() === categoria?.toLowerCase(),
  );

  const lista = [...posts]
    .filter((p) => (ativa ? p.category === ativa : true))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        eyebrow="Conteúdos"
        title="Artigos sobre Jiu-Jitsu"
        subtitle="Técnicas, mentalidade, evolução e tudo sobre a arte suave."
        breadcrumb={[
          { href: "/", label: "Home" },
          { label: "Conteúdos" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <nav aria-label="Filtrar por categoria">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Tag href="/blog" isActive={!ativa} count={posts.length}>
                Todos
              </Tag>
            </li>
            {CATEGORIAS.map((c) => {
              const total = posts.filter((p) => p.category === c).length;
              if (total === 0) return null;
              return (
                <li key={c}>
                  <Tag
                    href={`/blog?categoria=${c.toLowerCase()}`}
                    isActive={ativa === c}
                    count={total}
                  >
                    {c}
                  </Tag>
                </li>
              );
            })}
          </ul>
        </nav>

        <p role="status" aria-live="polite" className="mt-6 text-small text-muted-foreground">
          {lista.length} {lista.length === 1 ? "artigo" : "artigos"}
          {ativa ? ` em ${ativa}` : ""}
        </p>

        {lista.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={FileText}
            title="Nenhum artigo nesta categoria"
            description="Ainda não publicamos nada aqui."
            actions={[{ href: "/blog", label: "Ver todos os artigos", primary: true }]}
          />
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((post) => (
              <li key={post.slug} className="flex">
                <PostCard post={post} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
