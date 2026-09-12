import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Play, ArrowLeft } from "lucide-react";
import { getPost, posts } from "@/data/blog";
import { Markdown } from "@/components/content/markdown";
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
    ? `https://www.lipeexplica.com${post.image}`
    : "https://www.lipeexplica.com/social-final/c01-hook.webp";
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://www.lipeexplica.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.lipeexplica.com/blog/${post.slug}`,
      type: "article",
      images: [{ url: ogImage, width: 1280, height: 720, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [ogImage] },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  );

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <nav className="text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        {" / "}
        <span className="text-foreground/70">{post.title}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="rounded-full bg-[color-mix(in_oklab,var(--royal)_12%,transparent)] px-2.5 py-1 text-[var(--royal)]">
          {post.category}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {post.readingTime}
        </span>
        <span>{formatDate(post.date).split(",")[0]}</span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {post.description}
      </p>

      {post.image ? (
        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src={post.image}
            alt={post.title}
            width={1280}
            height={720}
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
          className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-[var(--royal)]/50"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--royal)] text-white">
            <Play className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="font-semibold">Assistir o Reel</p>
            <p className="text-sm text-muted-foreground">
              Ver a versão em vídeo deste conteúdo
            </p>
          </div>
        </a>
      ) : null}

      <div className="mt-10">
        <Markdown source={post.body} />
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--royal)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Todos os artigos
        </Link>
      </div>

      {related.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Artigos relacionados</h2>
          <div className="mt-4 space-y-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block rounded-xl border border-border bg-card p-5 transition hover:border-[var(--royal)]/50"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {p.category} · {p.readingTime}
                </p>
                <p className="mt-1 font-display font-semibold">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
