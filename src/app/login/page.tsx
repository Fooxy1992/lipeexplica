import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/library");

  return (
    <div className="flex min-h-dvh bg-[#EEF2FA]">
      {/* ── Left brand panel ── */}
      <div
        className="hidden flex-col justify-between p-10 lg:flex lg:w-[420px] xl:w-[480px]"
        style={{
          background: "linear-gradient(160deg, #1C1E2E 0%, #2a1a16 60%, #FF4D2D 140%)",
        }}
      >
        <Link
          href="/"
          className="font-display text-2xl font-bold text-white"
        >
          Lipe<span style={{ color: "#FF7A5C" }}>Explica</span>
        </Link>

        <div>
          <p className="text-4xl font-bold leading-tight text-white">
            Sua biblioteca de aulas começa aqui.
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Acesse suas dinâmicas, acompanhe o progresso e aplique no tatame com confiança.
          </p>
        </div>

        <p className="text-xs text-white/30">© {new Date().getFullYear()} LipeExplica</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link
          href="/"
          className="mb-8 font-display text-2xl font-bold text-[#1C1E2E] lg:hidden"
        >
          Lipe<span style={{ color: "#FF4D2D" }}>Explica</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#E4EAF4]">
            <h1 className="font-display text-2xl font-bold text-[#1C1E2E]">
              Acesse sua conta
            </h1>
            <p className="mt-2 text-sm text-[#8B92A8]">
              Use o email da sua compra — enviamos um link mágico ou entre com senha.
            </p>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-[#8B92A8]">
            Ainda não comprou?{" "}
            <Link
              href="/50dinamicas#comprar"
              className="font-semibold text-[#FF4D2D] underline-offset-4 hover:underline"
            >
              Conheça o livro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
