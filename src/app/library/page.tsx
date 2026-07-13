import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, LogOut, ShoppingBag, TrendingUp } from "lucide-react";
import { userScopedContainer } from "@/infrastructure/di/container";
import { signOut } from "@/app/auth/actions";
import { LibraryCard } from "@/components/library/library-card";

export const metadata: Metadata = { title: "Minha Biblioteca" };
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();
  if (!user) redirect("/login?next=/library");

  const profile = await c.profiles.findById(user.id);
  const items = await c.getUserLibrary.execute(user.id, profile?.isAdmin ?? false);

  const firstName = profile?.name?.split(" ")[0] ?? null;

  // Overall progress across all owned books
  const totalPct =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.progressPct, 0) / items.length)
      : 0;

  return (
    <div className="site-dark min-h-dvh bg-background">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-base font-bold">
            lipe<span style={{ color: "var(--royal)" }}>explica</span>
          </Link>
          <div className="flex items-center gap-2">
            {profile?.isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                Admin
              </Link>
            ) : null}
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* ── Welcome banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--royal) 8%, var(--card)), var(--card))",
          }}
        >
          {/* Decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: "color-mix(in oklab, var(--royal) 25%, transparent)" }}
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {firstName ? `Olá, ${firstName} 🥋` : "Bem-vindo(a) 🥋"}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Minha Biblioteca
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length === 0
                  ? "Comece sua jornada no jiu-jitsu."
                  : `${items.length} ${items.length === 1 ? "título" : "títulos"} na sua coleção`}
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" style={{ color: "var(--royal)" }} />
                  <span className="text-xs font-medium">Progresso geral</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-display text-3xl font-black"
                    style={{ color: totalPct > 0 ? "var(--royal)" : "var(--muted-foreground)" }}
                  >
                    {totalPct}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar (only if has books) */}
          {items.length > 0 && (
            <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${totalPct}%`,
                  background: "linear-gradient(90deg, var(--royal), var(--gold))",
                }}
              />
            </div>
          )}
        </div>

        {/* ── Book grid or empty state ── */}
        {items.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card text-muted-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-foreground">
              Sua biblioteca está vazia
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Compras aparecem aqui automaticamente após o pagamento.
            </p>
            <Link
              href="/50dinamicas#comprar"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--royal)" }}
            >
              <ShoppingBag className="h-4 w-4" /> Conhecer os produtos
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <LibraryCard key={item.product.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
