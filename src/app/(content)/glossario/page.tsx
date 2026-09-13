import type { Metadata } from "next";
import { termos, categoriasGlossario } from "@/data/glossario";
import { PageHeader } from "@/components/content/page-header";
import { GlossarioBrowser } from "@/components/content/glossario-browser";

export const metadata: Metadata = {
  title: "Glossário de Jiu-Jitsu",
  description:
    "Todos os termos que você precisa conhecer no tatame, explicados de forma clara e direta.",
  alternates: { canonical: "/glossario" },
};

export default function GlossarioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Referência"
        title="Glossário de Jiu-Jitsu"
        subtitle="Todos os termos que você precisa conhecer no tatame, explicados de forma clara e direta."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Glossário" }]}
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <GlossarioBrowser termos={termos} categorias={categoriasGlossario} />
      </section>
    </>
  );
}
