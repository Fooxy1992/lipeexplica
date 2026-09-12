/** Reels do canal (conteúdo portado do site original lipeexplica.com). */
export interface Reel {
  id: string;
  title: string;
  views: string;
  url: string;
  /** cor de destaque do card (faixa relacionada) */
  accent: string;
}

export const reels: Reel[] = [
  {
    id: "faixa-roxa",
    title: "A Faixa Roxa",
    views: "134K",
    url: "https://www.instagram.com/reel/DZyTIKOsEbb/",
    accent: "#7c3aed",
  },
  {
    id: "faixa-marrom",
    title: "A Faixa Marrom",
    views: "50.8K",
    url: "https://www.instagram.com/reel/DZzmRa-MHY3/",
    accent: "#92400e",
  },
  {
    id: "faixa-azul",
    title: "A Faixa Azul",
    views: "48.9K",
    url: "https://www.instagram.com/reel/DZw-CY1spQf/",
    accent: "#2563eb",
  },
  {
    id: "misterio-faixa-preta",
    title: "O Mistério da Faixa Preta",
    views: "37K",
    url: "https://www.instagram.com/reel/DZ2tX3Is92j/",
    accent: "#18181b",
  },
  {
    id: "vale-da-faixa-azul",
    title: "O Vale da Faixa Azul",
    views: "31.2K",
    url: "https://www.instagram.com/reel/DaFontTsLb0/",
    accent: "#1d4ed8",
  },
  {
    id: "primeiro-ano-faixa-branca",
    title: "O Primeiro Ano — Faixa Branca",
    views: "23.8K",
    url: "https://www.instagram.com/reel/DZxFXlfMDXY/",
    accent: "#e4e4e7",
  },
  {
    id: "faixa-mais-perigosa",
    title: "A Faixa Mais Perigosa",
    views: "15.5K",
    url: "https://www.instagram.com/reel/DaFof26syAD/",
    accent: "#dc2626",
  },
  {
    id: "faixa-preta",
    title: "A Faixa Preta",
    views: "11.2K",
    url: "https://www.instagram.com/reel/DZ0T9vssARZ/",
    accent: "#18181b",
  },
];

export const INSTAGRAM_URL = "https://instagram.com/lipeexplica";
export const YOUTUBE_URL = "https://www.youtube.com/@lipe.explica";
export const TIKTOK_URL = "https://tiktok.com/@lipeexplica";
export const CONTACT_EMAIL = "geral@lipeexplica.com";
