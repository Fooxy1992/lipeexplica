import type { Metadata } from "next";
import { userScopedContainer } from "@/infrastructure/di/container";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { StickyCta } from "@/components/marketing/sticky-cta";
import {
  Hero,
  ProblemSection,
  TransformationSection,
  CategoriesSection,
  DemoSection,
  Benefits,
  Testimonials,
  AboutSection,
  GuaranteeSection,
  Faq,
  FinalCta,
} from "@/components/marketing/sections";

export const dynamic = "force-dynamic";

const PAGE_URL = "https://www.lipeexplica.com/50dinamicas";
const OG_IMAGE = "https://www.lipeexplica.com/social-final/c01-hook.webp";

export const metadata: Metadata = {
  title: "50 Dinâmicas para Jiu-Jitsu Infantil — Aulas mais divertidas e organizadas",
  description:
    "50 dinâmicas e brincadeiras prontas para professores de Jiu-Jitsu Infantil. Livro interativo com busca, favoritos e progresso. Aquecimento, coordenação, jogos, guarda, passagem e mais. Acesso vitalício.",
  keywords: [
    "dinâmicas para jiu-jitsu infantil",
    "brincadeiras para jiu-jitsu infantil",
    "jogos para jiu-jitsu infantil",
    "atividades para jiu-jitsu infantil",
    "aula de jiu-jitsu infantil",
    "como dar aula de jiu-jitsu infantil",
    "aquecimento para jiu-jitsu infantil",
    "dinâmicas para artes marciais infantis",
    "exercícios para crianças no jiu-jitsu",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "50 Dinâmicas para Jiu-Jitsu Infantil",
    description: "50 dinâmicas prontas para aplicar nas suas aulas. Aquecimento, jogos, coordenação, guarda e muito mais. Acesso vitalício por R$14,90.",
    url: PAGE_URL,
    siteName: "LipeExplica",
    locale: "pt_BR",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1080, height: 1080, alt: "50 Dinâmicas para Jiu-Jitsu Infantil — LipeExplica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "50 Dinâmicas para Jiu-Jitsu Infantil",
    description: "50 dinâmicas prontas para aplicar. Acesso vitalício por R$14,90.",
    images: [OG_IMAGE],
  },
};

const SLUG = "dinamicas-jiu-jitsu-infantil";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "50 Dinâmicas para Jiu-Jitsu Infantil",
      description:
        "50 dinâmicas interativas prontas para aplicar nas suas aulas de Jiu-Jitsu Infantil. Categorias: Aquecimento, Coordenação, Guarda, Passagem, Disciplina, Equipe e mais.",
      url: PAGE_URL,
      image: "https://www.lipeexplica.com/book/capa.webp",
      brand: { "@type": "Brand", name: "LipeExplica" },
      offers: {
        "@type": "Offer",
        price: "14.90",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "LipeExplica" },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "127",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Funciona para qualquer arte marcial infantil?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "As dinâmicas foram desenvolvidas especificamente para Jiu-Jitsu Infantil, mas muitas se adaptam bem ao Judô, Karatê e outras artes marciais.",
          },
        },
        {
          "@type": "Question",
          name: "Como acesso o livro após a compra?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Imediatamente pelo site lipeexplica.com, em qualquer dispositivo com internet — celular, tablet ou computador.",
          },
        },
        {
          "@type": "Question",
          name: "Há garantia de reembolso?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim, 7 dias de garantia incondicional. Basta solicitar por e-mail que devolvemos 100% do valor.",
          },
        },
      ],
    },
  ],
};

export default async function CinquentaDinamicasPage() {
  const c = await userScopedContainer();

  const [product, userResult] = await Promise.all([
    c.products.findBySlug(SLUG),
    c.db.auth.getUser(),
  ]);

  const isLoggedIn = Boolean(userResult.data.user);

  if (!product) {
    return (
      <div className="site-dark min-h-dvh">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="grid min-h-[50dvh] place-items-center px-6 text-center">
          <div>
            <h1 className="text-3xl font-black text-[#fafafa]">Em breve</h1>
            <p className="mt-3 text-sm text-[#71717a]">
              O livro está em preparação. Volte em instantes.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="site-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar isLoggedIn={isLoggedIn} />
      <main>
        {/* 1. Hero — DynamicPreview como elemento principal + preço */}
        <Hero product={product} />

        {/* 2. Problema — dor do professor */}
        <ProblemSection />

        {/* 3. Transformação — antes/depois */}
        <TransformationSection />

        {/* 4. Categorias — 9 categorias */}
        <CategoriesSection product={product} />

        {/* 5. Preview interativo — InlineDemo com blur gate */}
        <DemoSection product={product} />

        {/* 6. Benefícios — resultados reais */}
        <Benefits product={product} />

        {/* 7. Depoimentos + contadores */}
        <Testimonials product={product} />

        {/* 8. Sobre o Lipe */}
        <AboutSection />

        {/* 9. Garantia */}
        <GuaranteeSection />

        {/* 10. FAQ */}
        <Faq />

        {/* 11. CTA final */}
        <FinalCta product={product} />
      </main>
      <Footer />

      {/* Mobile sticky CTA */}
      <StickyCta product={product} />
    </div>
  );
}
