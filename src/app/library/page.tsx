import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, LogOut, ShoppingBag, TrendingUp, UserCog } from "lucide-react";
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

  const totalPct =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.progressPct, 0) / items.length)
      : 0;

  return (
    <div className="min-h-dvh bg-[#EEF2FA]">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-[#E4EAF4] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-base font-bold text-[#1C1E2E]">
            Lipe<span style={{ color: "#FF4D2D" }}>Explica</span>
          </Link>
          <div className="flex items-center gap-2">
            {profile?.isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full border border-[#E4EAF4] bg-white px-4 py-2 text-xs font-medium text-[#8B92A8] transition hover:border-[#FF4D2D]/40 hover:text-[#1C1E2E]"
              >
                Admin
              </Link>
            ) : null}
            <Link
              href="/conta"
              className="inline-flex items-center gap-2 rounded-full border border-[#E4EAF4] bg-white px-4 py-2 text-xs font-medium text-[#8B92A8] transition hover:border-[#FF4D2D]/40 hover:text-[#1C1E2E]"
            >
              <UserCog className="h-3.5 w-3.5" /> Conta
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[#E4EAF4] bg-white px-4 py-2 text-xs font-medium text-[#8B92A8] transition hover:border-[#FF4D2D]/40 hover:text-[#1C1E2E]"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* ── Welcome card ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E4EAF4]">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8B92A8]">
                {firstName ? `Olá, ${firstName} 🥋` : "Bem-vindo(a) 🥋"}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-[#1C1E2E] sm:text-3xl">
                Minha Biblioteca
              </h1>
              <p className="mt-1 text-sm text-[#8B92A8]">
                {items.length === 0
                  ? "Comece sua jornada no jiu-jitsu."
                  : `${items.length} ${items.length === 1 ? "título" : "títulos"} na sua coleção`}
              </p>
              {!profile?.name ? (
                <Link
                  href="/conta"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4D2D] underline-offset-4 hover:underline"
                >
                  <UserCog className="h-3.5 w-3.5" /> Complete seu perfil
                </Link>
              ) : null}
            </div>

            {items.length > 0 && (
              <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#EEF2FA] px-5 py-4 sm:flex-col sm:items-end sm:gap-1">
                <div className="flex items-center gap-2 text-[#8B92A8]">
                  <TrendingUp className="h-4 w-4 text-[#FF4D2D]" />
                  <span className="text-xs font-medium">Progresso geral</span>
                </div>
                <span
                  className="font-display text-3xl font-black"
                  style={{ color: totalPct > 0 ? "#FF4D2D" : "#B0B8CC" }}
                >
                  {totalPct}%
                </span>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="h-1.5 overflow-hidden bg-[#EEF2FA]">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${totalPct}%`,
                  background: "linear-gradient(90deg, #FF4D2D, #ff7a5c)",
                }}
              />
            </div>
          )}
        </div>

        {/* ── Book grid or empty state ── */}
        {items.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-[#E4EAF4] bg-white py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF2FA]">
              <BookOpen className="h-6 w-6 text-[#8B92A8]" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-[#1C1E2E]">
              Sua biblioteca está vazia
            </p>
            <p className="mt-1 max-w-xs text-sm text-[#8B92A8]">
              Compras aparecem aqui automaticamente após o pagamento.
            </p>
            <Link
              href="/50dinamicas#comprar"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF4D2D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20]"
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
