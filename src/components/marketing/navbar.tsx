import Link from "next/link";
import Image from "next/image";
import { BookOpen, Library } from "lucide-react";
import { INSTAGRAM_URL } from "@/data/reels";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/videos", label: "Vídeos" },
  { href: "/blog", label: "Blog" },
  { href: "/glossario", label: "Glossário" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

/** Navegação global — visual original do site (dark + brand-red). */
export function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="glass sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-[#FF4D2D]/30 transition group-hover:ring-[#FF4D2D]/60">
            <Image src="/logotipo.png" alt="lipeexplica" fill className="object-cover" />
          </span>
          <span className="text-xl font-black tracking-tight">
            <span className="text-[#fafafa]">lipe</span>
            <span className="text-[#FF4D2D]">explica</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#a1a1aa] transition hover:bg-white/5 hover:text-[#fafafa]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/50dinamicas"
            className="hidden items-center gap-1.5 rounded-full border border-[#FF4D2D]/40 bg-[#FF4D2D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#ffb4a5] transition hover:bg-[#FF4D2D]/20 sm:inline-flex"
          >
            <BookOpen className="h-3.5 w-3.5" />
            50 Dinâmicas
          </Link>
          <Link
            href={isLoggedIn ? "/library" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#e4e4e7] transition hover:bg-white/10"
          >
            <Library className="h-3.5 w-3.5" />
            {isLoggedIn ? "Biblioteca" : "Entrar"}
          </Link>
        </div>
      </div>

      {/* nav mobile */}
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
        {[...NAV_LINKS, { href: "/50dinamicas", label: "📕 50 Dinâmicas" }].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-[#a1a1aa] transition hover:text-[#fafafa]"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
