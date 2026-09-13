"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Library, BookOpen } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { NAV_ITEMS, isActive } from "./nav-config";
import { INSTAGRAM_URL } from "@/data/reels";
import { cn } from "@/lib/utils";

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Menu mobile em drawer.
 * Substitui a antiga faixa horizontal de pills: alvos de 48px, foco preso
 * dentro do painel enquanto aberto, Escape fecha e o foco volta ao botão.
 */
export function NavMobile({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Fecha ao navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape, focus trap e trava de scroll — só enquanto aberto.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    // Guardado agora: no cleanup o ref pode já apontar para outro nó.
    const trigger = triggerRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Devolve o foco a quem abriu.
      trigger?.focus();
    };
  }, [open]);

  const itemClass =
    "flex min-h-[52px] items-center gap-3 rounded-xl px-4 text-body-lg font-medium transition-colors duration-200";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] lg:hidden"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden />
        ) : (
          <Menu className="h-5 w-5" aria-hidden />
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={close}
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--background)_78%,transparent)] backdrop-blur-sm"
          />

          <div
            ref={panelRef}
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-[var(--surface-1)] shadow-2xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="text-label text-muted-foreground">Menu</span>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar menu"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <nav
              aria-label="Navegação principal"
              className="flex-1 overflow-y-auto p-3"
            >
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          itemClass,
                          active
                            ? "bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] text-[var(--brand)]"
                            : "text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <hr className="my-3 border-border" />

              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/50dinamicas"
                    className={cn(itemClass, "text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]")}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" aria-hidden />
                    50 Dinâmicas
                  </Link>
                </li>
                <li>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(itemClass, "text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]")}
                  >
                    <InstagramIcon className="h-5 w-5 shrink-0" />
                    Instagram
                    <span className="sr-only">(abre em nova aba)</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div className="shrink-0 border-t border-border p-3">
              <Link
                href={isLoggedIn ? "/library" : "/login"}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-body font-bold uppercase tracking-[0.08em] text-[var(--brand-foreground)] transition-[filter] hover:brightness-110"
              >
                <Library className="h-4 w-4 shrink-0" aria-hidden />
                {isLoggedIn ? "Biblioteca" : "Entrar"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
