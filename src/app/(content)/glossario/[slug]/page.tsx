import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { termos } from "@/data/glossario";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return termos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const termo = termos.find((t) => t.slug === slug);
  if (!termo) return {};
  const ogImage = "https://www.lipeexplica.com/social-final/c01-hook.webp";
  const title = `${termo.nome} — Glossário de Jiu-Jitsu`;
  return {
    title,
    description: termo.descricao,
    alternates: { canonical: `https://www.lipeexplica.com/glossario/${termo.slug}` },
    openGraph: {
      title,
      description: termo.descricao,
      url: `https://www.lipeexplica.com/glossario/${termo.slug}`,
      images: [{ url: ogImage, width: 1080, height: 1080, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: termo.descricao, images: [ogImage] },
  };
}

export default async function TermoPage({ params }: PageProps) {
  const { slug } = await params;
  const termo = termos.find((t) => t.slug === slug);
  if (!termo) notFound();

  const relacionados = termos.filter(
    (t) => t.categoria === termo.categoria && t.slug !== termo.slug,
  );

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <nav className="text-xs text-muted-foreground">
        <Link href="/glossario" className="hover:text-foreground">Glossário</Link>
        {" / "}
        <span className="text-foreground/70">{termo.nome}</span>
      </nav>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-[var(--royal)]">
        {termo.categoria}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{termo.nome}</h1>
      <p className="mt-5 text-lg leading-relaxed text-foreground/85">
        {termo.descricao}
      </p>

      <Link
        href="/glossario"
        className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-[var(--royal)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao glossário
      </Link>

      {relacionados.length > 0 ? (
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-lg font-semibold">
            Mais em {termo.categoria}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relacionados.map((t) => (
              <Link
                key={t.slug}
                href={`/glossario/${t.slug}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-[var(--royal)]"
              >
                {t.nome}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
