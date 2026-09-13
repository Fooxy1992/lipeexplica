import { posts } from "@/data/blog";
import { termos } from "@/data/glossario";
import { reels } from "@/data/reels";
import { categorias } from "@/data/categorias";

export interface SearchItem {
  id: string;
  tipo: "Categoria" | "Artigo" | "Termo" | "Reel";
  titulo: string;
  descricao: string;
  href: string;
  external?: boolean;
  /** texto concatenado usado na comparação */
  haystack: string;
}

/** Remove acentos e caixa para que "kimurá" e "KIMURA" batam igual. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function item(
  partial: Omit<SearchItem, "haystack"> & { extra?: string },
): SearchItem {
  const { extra, ...rest } = partial;
  return {
    ...rest,
    haystack: normalize(
      [rest.titulo, rest.descricao, rest.tipo, extra].filter(Boolean).join(" "),
    ),
  };
}

/**
 * Índice de busca montado a partir dos dados estáticos do site.
 * É pequeno (≈80 itens) e roda inteiro no cliente — nenhuma dependência de
 * busca foi adicionada.
 */
export const searchIndex: SearchItem[] = [
  ...categorias.map((c) =>
    item({
      id: `categoria-${c.slug}`,
      tipo: "Categoria",
      titulo: c.nome,
      descricao: c.tagline,
      href: `/aprender/${c.slug}`,
    }),
  ),
  ...posts.map((p) =>
    item({
      id: `post-${p.slug}`,
      tipo: "Artigo",
      titulo: p.title,
      descricao: p.description,
      href: `/blog/${p.slug}`,
      extra: [p.category, ...p.tags].join(" "),
    }),
  ),
  ...termos.map((t) =>
    item({
      id: `termo-${t.slug}`,
      tipo: "Termo",
      titulo: t.nome,
      descricao: t.descricao,
      href: `/glossario/${t.slug}`,
      extra: t.categoria,
    }),
  ),
  ...reels.map((r) =>
    item({
      id: `reel-${r.id}`,
      tipo: "Reel",
      titulo: r.title,
      descricao: `${r.views} visualizações no Instagram`,
      href: r.url,
      external: true,
    }),
  ),
];

/**
 * Busca por todos os termos digitados (AND). Ordena quem casa no título antes
 * de quem só casa na descrição.
 */
export function search(query: string, limit = 20): SearchItem[] {
  const termosBusca = normalize(query).split(/\s+/).filter(Boolean);
  if (termosBusca.length === 0) return [];

  return searchIndex
    .filter((entry) => termosBusca.every((t) => entry.haystack.includes(t)))
    .map((entry) => {
      const tituloNorm = normalize(entry.titulo);
      const noTitulo = termosBusca.filter((t) => tituloNorm.includes(t)).length;
      const comecaCom = tituloNorm.startsWith(termosBusca[0] ?? "") ? 1 : 0;
      return { entry, score: noTitulo * 2 + comecaCom };
    })
    .sort((a, b) => b.score - a.score || a.entry.titulo.localeCompare(b.entry.titulo))
    .slice(0, limit)
    .map((r) => r.entry);
}
