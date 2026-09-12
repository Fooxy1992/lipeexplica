import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server";
import { RedeemForm } from "@/components/invite/redeem-form";

export const metadata: Metadata = { title: "Convite" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

interface InviteView {
  active: boolean;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  products: { title: string; active: boolean } | null;
}

export default async function ConvitePage({ params }: PageProps) {
  const { token } = await params;

  const admin = createSupabaseAdminClient();
  const { data: invite } = await admin
    .from("invites")
    .select("active, max_uses, used_count, expires_at, products ( title, active )")
    .eq("token", token)
    .maybeSingle<InviteView>();

  const valid =
    invite &&
    invite.active &&
    invite.used_count < invite.max_uses &&
    (!invite.expires_at || new Date(invite.expires_at) >= new Date()) &&
    invite.products?.active;

  return (
    <div className="flex min-h-dvh bg-[#EEF2FA]">
      {/* ── Left brand panel ── */}
      <div
        className="hidden flex-col justify-between p-10 lg:flex lg:w-[420px] xl:w-[480px]"
        style={{
          background: "linear-gradient(160deg, #1C1E2E 0%, #2a1a16 60%, #FF4D2D 140%)",
        }}
      >
        <Link href="/" className="font-display text-2xl font-bold text-white">
          Lipe<span style={{ color: "#FF7A5C" }}>Explica</span>
        </Link>

        <div>
          <p className="text-4xl font-bold leading-tight text-white">
            Bem-vindo ao grupo de professores! 🥋
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Crie sua conta para acessar as 50 dinâmicas e transformar suas aulas.
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
            {valid ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4D2D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#FF4D2D]">
                  🎟️ Você foi convidado
                </span>
                <h1 className="mt-3 font-display text-2xl font-bold text-[#1C1E2E]">
                  {invite.products?.title}
                </h1>
                <p className="mt-2 text-sm text-[#8B92A8]">
                  Preencha seus dados para liberar o acesso na sua biblioteca.
                  Sem senha: você entra com link mágico ou com o email abaixo.
                </p>
                <RedeemForm token={token} />
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50">
                  <span className="text-2xl">🚫</span>
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold text-[#1C1E2E]">
                  Convite inválido
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#8B92A8]">
                  Este link expirou, foi revogado ou já atingiu o limite de usos.
                  Fale com quem te enviou — ou conheça o livro:
                </p>
                <Link
                  href="/50dinamicas"
                  className="mt-6 inline-block rounded-xl bg-[#FF4D2D] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20]"
                >
                  Ver o livro
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
