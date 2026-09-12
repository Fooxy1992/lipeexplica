"use client";

import { useActionState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { updatePassword, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = { ok: false, message: "" };

const inputCls =
  "mt-2 w-full rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 text-sm text-[#1C1E2E] placeholder:text-[#B0B8CC] outline-none transition focus:border-[#FF4D2D] focus:bg-white";

const labelCls =
  "block text-xs font-semibold uppercase tracking-widest text-[#8B92A8]";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#EEF2FA] px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#E4EAF4]">
          <h1 className="font-display text-2xl font-bold text-[#1C1E2E]">
            Nova senha
          </h1>
          <p className="mt-2 text-sm text-[#8B92A8]">
            Escolha uma senha com pelo menos 8 caracteres.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <label className={labelCls}>
              Nova senha
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Confirmar senha
              <input
                type="password"
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputCls}
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D2D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20] disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              Salvar nova senha
            </button>

            {state.message ? (
              <p
                className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-500"}`}
                role="alert"
              >
                {state.message}
              </p>
            ) : null}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#8B92A8]">
          <Link href="/login" className="font-semibold text-[#FF4D2D] underline-offset-4 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
