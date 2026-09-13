/**
 * Atalho de teclado para pular a navegação. Invisível até receber foco.
 * Requer um elemento com id="conteudo" na página (o <main> dos layouts).
 */
export function SkipLink({ href = "#conteudo" }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-full focus:bg-[var(--brand)] focus:px-6 focus:text-small focus:font-semibold focus:text-[var(--brand-foreground)]"
    >
      Pular para o conteúdo
    </a>
  );
}
