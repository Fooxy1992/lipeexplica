import Link from "next/link";
import Image from "next/image";
import {
  CONTACT_EMAIL,
  INSTAGRAM_URL,
  TIKTOK_URL,
  YOUTUBE_URL,
} from "@/data/reels";
import { categorias } from "@/data/categorias";

const SITE_LINKS = [
  { href: "/aprender", label: "Aprender" },
  { href: "/blog", label: "Conteúdos" },
  { href: "/glossario", label: "Glossário" },
  { href: "/videos", label: "Vídeos" },
  { href: "/buscar", label: "Buscar" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

const PRODUTO_LINKS = [
  { href: "/50dinamicas", label: "50 Dinâmicas" },
  { href: "/library", label: "Biblioteca" },
];

const SOCIAIS = [
  { href: INSTAGRAM_URL, label: "Instagram" },
  { href: YOUTUBE_URL, label: "YouTube" },
  { href: TIKTOK_URL, label: "TikTok" },
];

const linkClass =
  "inline-flex min-h-9 w-fit items-center text-small text-muted-foreground transition-colors duration-200 hover:text-foreground";

function Coluna({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-label text-muted-foreground">{titulo}</h3>
      <ul className="mt-4 flex flex-col gap-1">{children}</ul>
    </div>
  );
}

/** Rodapé do site público — 4 colunas. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-[var(--surface-1)]">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[200px] w-[600px] -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--brand)_6%,transparent)] blur-[80px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex w-fit items-center gap-2.5">
              <span className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[color-mix(in_oklab,var(--brand)_25%,transparent)]">
                <Image
                  src="/logotipo.webp"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="text-xl font-black tracking-[-0.02em]">
                <span className="text-foreground">lipe</span>
                <span className="text-[var(--brand)]">explica</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-small text-muted-foreground">
              Jiu-Jitsu sem enrolação. Técnicas, mentalidade e evolução
              explicadas de forma visual.
            </p>

            <ul className="mt-6 flex flex-wrap items-center gap-4">
              {SOCIAIS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {s.label}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Coluna titulo="Aprender">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/aprender/${c.slug}`} className={linkClass}>
                  {c.nome}
                </Link>
              </li>
            ))}
          </Coluna>

          <Coluna titulo="Site">
            {SITE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Coluna>

          <div className="flex flex-col gap-10">
            <Coluna titulo="Produtos">
              {PRODUTO_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </Coluna>

            <div>
              <h3 className="text-label text-muted-foreground">Contato</h3>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-4 inline-flex min-h-9 items-center text-small text-muted-foreground transition-colors hover:text-[var(--brand)]"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-1 text-caption text-muted-foreground">
                Parcerias e colaborações bem-vindas.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-caption text-muted-foreground">
            © {new Date().getFullYear()} LipeExplica. Todos os direitos
            reservados.
          </p>
          <p aria-hidden className="text-caption text-muted-foreground">
            OSS 🥋
          </p>
        </div>
      </div>
    </footer>
  );
}
