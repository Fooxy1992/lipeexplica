import type { LucideIcon } from "lucide-react";
import { Swords, Brain, ScrollText, Trophy, Shield, Award } from "lucide-react";
import { posts, type BlogPost } from "@/data/blog";
import { termos, type Termo } from "@/data/glossario";
import { reels, type Reel } from "@/data/reels";

/**
 * TAXONOMIA — fonte única de verdade do site.
 *
 * As 6 categorias são a porta de entrada para o conteúdo. Elas NÃO duplicam
 * conteúdo: cada categoria é uma visão agregada sobre os dados que já existem
 * em blog.ts, glossario.ts e reels.ts, ligados pelos campos abaixo.
 *
 * Consequência importante: nenhuma URL existente muda e nenhum conteúdo
 * precisa ser reescrito para a taxonomia funcionar.
 *
 * Categorias sem conteúdo permanecem visíveis e declaram isso honestamente
 * ("Em breve"). Nunca preencher com conteúdo fictício.
 */
export interface Categoria {
  slug: string;
  nome: string;
  /** frase curta usada no card da Home */
  tagline: string;
  /** texto de abertura da página da categoria */
  descricao: string;
  icon: LucideIcon;
  /** categorias do blog que alimentam esta categoria */
  blogCategories: BlogPost["category"][];
  /** categorias do glossário que alimentam esta categoria */
  glossarioCategories: Termo["categoria"][];
  /** ids de reels relacionados (ver data/reels.ts) */
  reelIds: string[];
  /**
   * Posts avulsos, por slug, que pertencem a esta categoria mesmo tendo outra
   * `category` no blog. Existe porque a categoria editorial "Infantil" é
   * voltada a professores e não corresponde a nenhuma das 6 categorias do
   * aluno — mas alguns desses textos são relevantes aqui.
   */
  extraPostSlugs?: string[];
}

export const categorias: Categoria[] = [
  {
    slug: "tecnicas",
    nome: "Técnicas",
    tagline: "Guarda, passagem, finalização — o detalhe que muda tudo.",
    descricao:
      "Os movimentos que formam o Jiu-Jitsu: guardas, passagens, posições e finalizações. Cada termo explicado de forma direta, sem jargão desnecessário.",
    icon: Swords,
    blogCategories: [],
    glossarioCategories: [
      "Técnicas",
      "Guardas",
      "Posições",
      "Finalizações",
      "Fundamentos",
    ],
    reelIds: [],
  },
  {
    slug: "mentalidade",
    nome: "Mentalidade",
    tagline: "O jogo mental por trás do tatame.",
    descricao:
      "O que acontece na cabeça de quem treina. Ansiedade, ego, frustração, constância — a parte do Jiu-Jitsu que ninguém filma, mas que decide quem fica.",
    icon: Brain,
    blogCategories: ["Mentalidade"],
    glossarioCategories: [],
    reelIds: [],
  },
  {
    slug: "historia",
    nome: "História",
    tagline: "Das origens japonesas ao domínio brasileiro.",
    descricao:
      "De onde o Jiu-Jitsu veio, como chegou ao Brasil e por que se tornou o que é hoje. Cultura, tradição e as histórias que explicam o tatame.",
    icon: ScrollText,
    blogCategories: ["Curiosidades"],
    glossarioCategories: ["Cultura"],
    reelIds: [],
  },
  {
    slug: "sistema-de-faixas",
    nome: "Sistema de Faixas",
    tagline: "Da branca à preta — o que cada faixa significa.",
    descricao:
      "A jornada da graduação: o que se espera de cada faixa, quanto tempo leva, por que tanta gente para na azul e o que realmente muda de uma cor para a outra.",
    icon: Award,
    blogCategories: ["Faixas"],
    glossarioCategories: [],
    reelIds: [
      "primeiro-ano-faixa-branca",
      "faixa-azul",
      "vale-da-faixa-azul",
      "faixa-roxa",
      "faixa-marrom",
      "faixa-preta",
      "misterio-faixa-preta",
      "faixa-mais-perigosa",
    ],
    extraPostSlugs: ["jiujitsu-infantil-progressao-faixas"],
  },
  {
    slug: "competicoes",
    nome: "Competições",
    tagline: "O que ninguém te conta sobre competir.",
    descricao:
      "Regras, estratégia, preparação e o lado psicológico de subir no pódio — ou de perder. Conteúdo em produção.",
    icon: Trophy,
    blogCategories: [],
    glossarioCategories: [],
    reelIds: [],
  },
  {
    slug: "defesa-pessoal",
    nome: "Defesa Pessoal",
    tagline: "Como o Jiu-Jitsu se aplica fora do tatame.",
    descricao:
      "A origem do Jiu-Jitsu é a defesa pessoal. O que funciona na rua, o que é mito e onde o esporte e a autodefesa se separam. Conteúdo em produção.",
    icon: Shield,
    blogCategories: [],
    glossarioCategories: [],
    reelIds: [],
  },
];

export function getCategoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}

export interface ConteudoDaCategoria {
  posts: BlogPost[];
  termos: Termo[];
  reels: Reel[];
  /** soma de artigos + termos + reels */
  total: number;
  /** true quando a categoria ainda não tem nada publicado */
  vazia: boolean;
}

/** Agrega o conteúdo já existente que pertence a uma categoria. */
export function getConteudoDaCategoria(
  categoria: Categoria,
): ConteudoDaCategoria {
  const extras = categoria.extraPostSlugs ?? [];
  const catPosts = posts
    .filter(
      (p) =>
        categoria.blogCategories.includes(p.category) ||
        extras.includes(p.slug),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const catTermos = termos.filter((t) =>
    categoria.glossarioCategories.includes(t.categoria),
  );

  const catReels = categoria.reelIds
    .map((id) => reels.find((r) => r.id === id))
    .filter((r): r is Reel => Boolean(r));

  const total = catPosts.length + catTermos.length + catReels.length;

  return {
    posts: catPosts,
    termos: catTermos,
    reels: catReels,
    total,
    vazia: total === 0,
  };
}

/**
 * Resumo curto para o card da categoria — ex.: "2 artigos · 5 termos".
 * Retorna null quando não há nada, para o card poder declarar "Em breve".
 */
export function resumoDaCategoria(categoria: Categoria): string | null {
  const { posts: p, termos: t, reels: r } = getConteudoDaCategoria(categoria);

  const partes = [
    p.length > 0 ? `${p.length} ${p.length === 1 ? "artigo" : "artigos"}` : null,
    t.length > 0 ? `${t.length} ${t.length === 1 ? "termo" : "termos"}` : null,
    r.length > 0 ? `${r.length} ${r.length === 1 ? "reel" : "reels"}` : null,
  ].filter((x): x is string => Boolean(x));

  return partes.length > 0 ? partes.join(" · ") : null;
}

/**
 * TRILHAS — "Comece por aqui".
 * Cada trilha aponta para categorias reais; nenhuma inventa destino.
 */
export interface Trilha {
  slug: string;
  titulo: string;
  descricao: string;
  /** slugs de categorias, em ordem de leitura sugerida */
  categorias: string[];
}

export const trilhas: Trilha[] = [
  {
    slug: "iniciante",
    titulo: "Sou iniciante",
    descricao: "Comece pelos fundamentos e entenda o que te espera na branca.",
    categorias: ["sistema-de-faixas", "tecnicas", "mentalidade"],
  },
  {
    slug: "ja-treino",
    titulo: "Já treino",
    descricao: "Aprofunde o vocabulário técnico e o lado mental da evolução.",
    categorias: ["tecnicas", "mentalidade", "historia"],
  },
  {
    slug: "quero-competir",
    titulo: "Quero competir",
    descricao: "Estratégia, cabeça de competidor e o repertório que decide luta.",
    categorias: ["competicoes", "tecnicas", "mentalidade"],
  },
];

/** Categoria à qual um artigo pertence, se houver. */
export function getCategoriaDoPost(post: BlogPost): Categoria | undefined {
  return categorias.find(
    (c) =>
      c.blogCategories.includes(post.category) ||
      (c.extraPostSlugs ?? []).includes(post.slug),
  );
}

/** Categoria à qual um termo do glossário pertence, se houver. */
export function getCategoriaDoTermo(termo: Termo): Categoria | undefined {
  return categorias.find((c) => c.glossarioCategories.includes(termo.categoria));
}
