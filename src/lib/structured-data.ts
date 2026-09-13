import { INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL } from "@/data/reels";

export const SITE_URL = "https://www.lipeexplica.com";
export const SITE_NAME = "LipeExplica";

/** Organization — identidade do canal. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logotipo.png`,
    description:
      "Conteúdo visual sobre Jiu-Jitsu: técnicas, mentalidade, história e evolução.",
    sameAs: [INSTAGRAM_URL, YOUTUBE_URL, TIKTOK_URL],
  };
}

/** WebSite + SearchAction — habilita a caixa de busca do site na SERP. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Article — usado nas páginas de post do blog. */
export function articleJsonLd(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pt-BR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(post.image ? { image: `${SITE_URL}${post.image}` } : {}),
  };
}

/** DefinedTerm — usado nos termos do glossário. */
export function definedTermJsonLd(termo: {
  slug: string;
  nome: string;
  categoria: string;
  descricao: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: termo.nome,
    description: termo.descricao,
    inLanguage: "pt-BR",
    url: `${SITE_URL}/glossario/${termo.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Glossário de Jiu-Jitsu — LipeExplica",
      url: `${SITE_URL}/glossario`,
    },
    termCode: termo.categoria,
  };
}
