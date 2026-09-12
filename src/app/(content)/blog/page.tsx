import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { posts } from "@/data/blog";
import { PageHeader } from "@/components/content/page-header";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos sobre Jiu-Jitsu: técnicas, mentalidade, evolução e tudo sobre a arte suave.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Artigos sobre Jiu-Jitsu"
        subtitle="Técnicas, mentalidade, evolução e tudo sobre a arte suave."
      />
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-border bg-card transition hover:border-[var(--royal)]/50 hover:shadow-md overflow-hidden"
            >
              {post.image ? (
                <div className="overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={800}
                    height={450}
                    className="w-full object-cover transition group-hover:scale-[1.02]"
                  />
                </div>
              ) : null}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--royal)_12%,transparent)] px-2.5 py-1 text-[var(--royal)]">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {post.readingTime}
                  </span>
                  <span>{formatDate(post.date).split(",")[0]}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug group-hover:text-[var(--royal)]">
                  {post.title}
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
