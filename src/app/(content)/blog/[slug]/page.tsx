import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Play, ArrowRight } from "lucide-react";
import { getPost, posts } from "@/data/blog";
import { getCategoriaDoPost } from "@/data/categorias";
import { Markdown } from "@/components/content/markdown";
import { PostCard } from "@/components/content/post-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, breadcrumbJsonLd } from "@/components/ui/breadcrumb";
import { articleJsonLd, SITE_URL } from "@/lib/structured-data";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const ogImage = post.image
    ? `${SITE_URL}${post.image}`
    : `${SITE_URL}/social-final/c01-hook.webp`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1280, height: 720, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const categoria = getCategoriaDoPost(post);

  const ordenados = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const indice = ordenados.findIndex((p) => p.slug === post.slug);
  // Próximo na linha do tempo; volta ao início quando este é o último.
  const proximo = ordenados[indice + 1] ?? ordenados[0];

  const relacionados = posts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const trilha = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Conteúdos" },
    { label: post.title },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            articleJsonLd(post),
            breadcrumbJsonLd(trilha, SITE_URL),
          ]),
        }}
      />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Breadcrumb items={trilha} />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge variant="brand">{post.category}</Badge>
          <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden /> {post.readingTime}
          </span>
          <time dateTime={post.date} className="text-caption text-muted-foreground">
            {formatDate(post.date).split(",")[0]}
          </time>
        </div>

        <h1 className="mt-4 text-h1 text-foreground">{post.title}</h1>

        <p className="mt-5 text-body-lg text-muted-foreground">
          {post.description}
        </p>

        {post.image ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <Image
              src={post.image}
              alt=""
              width={1280}
              height={720}
              sizes="(max-width: 768px) 100vw, 768px"
              className="w-full object-cover"
              priority
            />
          </div>
        ) : null}

        {post.reelUrl ? (
          <a
            href={post.reelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)]"
          >
            <span
              aria-hidden
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-foreground)]"
            >
              <Play className="h-5 w-5 fill-current" />
            </span>
            <span>
              <span className="block text-body font-semibold text-foreground">
                Assistir o Reel
              </span>
              <span className="block text-small text-muted-foreground">
                A versão em vídeo deste conteúdo
              </span>
            </span>
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        ) : null}

        <div className="mt-12">
          <Markdown source={post.body} />
        </div>

        {categoria ? (
          <p className="mt-12 border-t border-border pt-8 text-body text-muted-foreground">
            Este artigo faz parte de{" "}
            <Link
              href={`/aprender/${categoria.slug}`}
              className="font-semibold text-[var(--brand)] hover:underline"
            >
              {categoria.nome}
            </Link>
            .
          </p>
        ) : null}

        {/* Próximo conteúdo — nunca deixa o leitor num beco sem saída. */}
        {proximo ? (
          <nav
            aria-label="Próximo conteúdo"
            className="mt-8 rounded-2xl border border-border bg-card p-6"
          >
            <p className="text-label text-muted-foreground">Leia a seguir</p>
            <Link
              href={`/blog/${proximo.slug}`}
              className="group mt-3 flex items-start justify-between gap-4"
            >
              <span>
                <span className="block text-h3 text-foreground">{proximo.title}</span>
                <span className="mt-1 block text-small text-muted-foreground">
                  {proximo.category} · {proximo.readingTime}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]"
              />
            </Link>
          </nav>
        ) : null}

        {relacionados.length > 0 ? (
          <section aria-labelledby="relacionados" className="mt-14">
            <h2 id="relacionados" className="text-h2 text-foreground">
              Mais em {post.category}
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {relacionados.map((p) => (
                <li key={p.slug} className="flex">
                  <PostCard post={p} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </>
  );
}
