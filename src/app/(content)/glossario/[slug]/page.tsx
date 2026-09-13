import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { termos } from "@/data/glossario";
import { getCategoriaDoTermo } from "@/data/categorias";
import { Breadcrumb, breadcrumbJsonLd } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { definedTermJsonLd, SITE_URL } from "@/lib/structured-data";

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
  const ogImage = `${SITE_URL}/social-final/c01-hook.webp`;
  const title = `${termo.nome} — Glossário de Jiu-Jitsu`;
  return {
    title,
    description: termo.descricao,
    alternates: { canonical: `${SITE_URL}/glossario/${termo.slug}` },
    openGraph: {
      title,
      description: termo.descricao,
      url: `${SITE_URL}/glossario/${termo.slug}`,
      images: [{ url: ogImage, width: 1080, height: 1080, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: termo.descricao, images: [ogImage] },
  };
}

export default async function TermoPage({ params }: PageProps) {
  const { slug } = await params;
  const termo = termos.find((t) => t.slug === slug);
  if (!termo) notFound();

  const categoria = getCategoriaDoTermo(termo);

  // Termos da mesma categoria para "Mais em X" e navegação
  const mesmaCat = termos.filter(
    (t) => t.categoria === termo.categoria && t.slug !== termo.slug,
  );

  // "Próximo termo" na mesma categoria (circular)
  const indice = termos.filter((t) => t.categoria === termo.categoria).findIndex(
    (t) => t.slug === termo.slug,
  );
  const catTermos = termos.filter((t) => t.categoria === termo.categoria);
  const proximoTermo = catTermos[indice + 1] ?? catTermos[0];

  const trilha = [
    { label: "Glossário", href: "/glossario" },
    ...(categoria
      ? [{ label: categoria.nome, href: `/aprender/${categoria.slug}` }]
      : []),
    { label: termo.nome },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            definedTermJsonLd(termo),
            breadcrumbJsonLd(trilha, SITE_URL),
          ]),
        }}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Breadcrumb items={trilha} className="mb-8" />

        <header className="mb-8">
          <Badge variant="neutral" className="mb-3">
            {termo.categoria}
          </Badge>
          <h1 className="text-h1 text-foreground">{termo.nome}</h1>
        </header>

        <p className="text-body-lg leading-relaxed text-foreground/85">
          {termo.descricao}
        </p>

        {/* Link para a categoria no /aprender */}
        {categoria ? (
          <div className="mt-10 rounded-xl border border-border bg-surface-1 p-5">
            <p className="text-caption text-muted-foreground">Este termo faz parte de</p>
            <Link
              href={`/aprender/${categoria.slug}`}
              className="mt-1 inline-flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-[var(--brand)]"
            >
              {categoria.nome}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}

        {/* Próximo termo */}
        {proximoTermo && proximoTermo.slug !== termo.slug ? (
          <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-surface-1 px-5 py-4">
            <span className="text-caption text-muted-foreground">Próximo termo</span>
            <Link
              href={`/glossario/${proximoTermo.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-[var(--brand)]"
            >
              {proximoTermo.nome}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}

        <Link
          href="/glossario"
          className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao glossário
        </Link>

        {/* Termos relacionados na mesma categoria */}
        {mesmaCat.length > 0 ? (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="mb-3 text-label font-semibold text-foreground">
              Mais em {termo.categoria}
            </h2>
            <div className="flex flex-wrap gap-2">
              {mesmaCat.map((t) => (
                <Link
                  key={t.slug}
                  href={`/glossario/${t.slug}`}
                  className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {t.nome}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </>
  );
}
