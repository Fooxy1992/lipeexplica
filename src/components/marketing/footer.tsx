import Link from "next/link";
import Image from "next/image";
import {
  CONTACT_EMAIL,
  INSTAGRAM_URL,
  TIKTOK_URL,
  YOUTUBE_URL,
} from "@/data/reels";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/videos", label: "Vídeos" },
  { href: "/blog", label: "Blog" },
  { href: "/glossario", label: "Glossário" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
  { href: "/50dinamicas", label: "Livro: 50 Dinâmicas" },
  { href: "/library", label: "Biblioteca" },
];

/** Footer — visual original do site. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-[#0d0d10] text-[#71717a]">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[200px] w-[600px] -translate-x-1/2 rounded-full bg-[#FF4D2D]/5 blur-[80px]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex w-fit items-center gap-2.5">
              <span className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#FF4D2D]/20">
                <Image src="/logotipo.png" alt="lipeexplica" fill className="object-cover" />
              </span>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-[#fafafa]">lipe</span>
                <span className="text-[#FF4D2D]">explica</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              Jiu-Jitsu explicado sem filtro. Técnicas, mentalidade e evolução
              com ilustrações cinematográficas.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-[#fafafa]">
                Instagram
              </a>
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-[#fafafa]">
                YouTube
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-[#fafafa]">
                TikTok
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#52525b]">
              Navegação
            </h4>
            <div className="flex flex-col gap-2.5">
              {NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm transition hover:text-[#fafafa]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#52525b]">
              Contato
            </h4>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="w-fit text-sm transition hover:text-[#FF4D2D]"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-[#3f3f46]">
              Parcerias e colaborações
              <br />
              bem-vindas!
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-[#3f3f46]">
            © {new Date().getFullYear()} lipeexplica. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#27272a]">OSS 🥋</p>
        </div>
      </div>
    </footer>
  );
}
