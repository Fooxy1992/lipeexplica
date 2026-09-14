import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { SkipLink } from "@/components/ui/skip-link";
import { Hero } from "@/components/home/hero";
import { CategoriasSection } from "@/components/home/categorias-section";
import { MetodoSection } from "@/components/home/metodo-section";
import { ProdutoSection } from "@/components/home/produto-section";
import { ComeceAquiSection } from "@/components/home/comece-aqui-section";
import { SobreSection } from "@/components/home/sobre-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import { AcaoSection } from "@/components/home/acao-section";
import { AcaoPopup } from "@/components/home/acao-popup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LipeExplica — Jiu-Jitsu sem enrolação",
  description:
    "Técnicas, mentalidade, história e evolução no Jiu-Jitsu explicadas de forma visual e direta. Comece a aprender pelas seis frentes do esporte.",
  alternates: { canonical: "/" },
};

/** Home — cada seção é um componente próprio em components/home. */
export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="site-dark min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
        }}
      />

      <SkipLink />
      <Navbar isLoggedIn={Boolean(user)} />

      <main id="conteudo">
        <Hero />
        <CategoriasSection />
        <MetodoSection />
        <ProdutoSection />
        <AcaoSection />
        <ComeceAquiSection />
        <SobreSection />
        <NewsletterSection />
      </main>

      <AcaoPopup />
      <Footer />
    </div>
  );
}
