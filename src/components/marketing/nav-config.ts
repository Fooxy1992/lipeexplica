/**
 * Estrutura de navegação do site público.
 * Compartilhada entre a navbar desktop e o drawer mobile para que as duas
 * nunca divirjam.
 */
export interface NavItem {
  href: string;
  label: string;
  /** casa também com as sub-rotas (ex.: /aprender/tecnicas) */
  matchPrefix?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/aprender", label: "Aprender", matchPrefix: true },
  { href: "/blog", label: "Conteúdos", matchPrefix: true },
  { href: "/glossario", label: "Glossário", matchPrefix: true },
  { href: "/sobre", label: "Sobre" },
];

/** true quando o item corresponde à rota atual. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === item.href;
}
