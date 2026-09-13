import Link from "next/link";
import Image from "next/image";
import { Library, Search } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { INSTAGRAM_URL } from "@/data/reels";
import { NavDesktop } from "./nav-desktop";
import { NavMobile } from "./nav-mobile";
import { SearchShortcut } from "./search-shortcut";

/** Navegação global do site público. */
export function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="LipeExplica — página inicial"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[color-mix(in_oklab,var(--brand)_30%,transparent)] transition-[box-shadow] group-hover:ring-[color-mix(in_oklab,var(--brand)_60%,transparent)]">
            <Image
              src="/logotipo.webp"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <span className="text-xl font-black tracking-[-0.02em]">
            <span className="text-foreground">lipe</span>
            <span className="text-[var(--brand)]">explica</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <NavDesktop />

          <Link
            href="/buscar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-foreground"
          >
            <Search className="h-5 w-5" aria-hidden />
            <span className="sr-only">Buscar (atalho: Ctrl ou Cmd + K)</span>
          </Link>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-foreground lg:inline-flex"
          >
            <InstagramIcon />
            <span className="sr-only">Instagram (abre em nova aba)</span>
          </a>

          <Link
            href={isLoggedIn ? "/library" : "/login"}
            className="hidden min-h-11 items-center gap-1.5 rounded-full border border-border bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] px-4 text-small font-semibold text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)] sm:inline-flex"
          >
            <Library className="h-4 w-4" aria-hidden />
            {isLoggedIn ? "Biblioteca" : "Entrar"}
          </Link>

          <NavMobile isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <SearchShortcut />
    </header>
  );
}
