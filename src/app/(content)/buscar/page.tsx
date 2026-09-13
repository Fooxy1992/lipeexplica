import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/content/page-header";
import { SearchResults } from "@/components/content/search-results";
import { LoadingState } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Buscar",
  description:
    "Busque por técnicas, termos do glossário, artigos e vídeos sobre Jiu-Jitsu no LipeExplica.",
  alternates: { canonical: "/buscar" },
  robots: { index: false, follow: true },
};

export default function BuscarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Busca"
        title="O que você procura?"
        subtitle="Categorias, artigos, termos do glossário e vídeos — tudo em um lugar."
      />
      <Suspense fallback={<LoadingState className="py-20 text-center" />}>
        <SearchResults />
      </Suspense>
    </>
  );
}
