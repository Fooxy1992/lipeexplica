"use client";

import { useActionState, useState } from "react";
import { Loader2, Mail, KeyRound } from "lucide-react";
import {
  signInWithMagicLink,
  signInWithPassword,
  signInWithOAuth,
  type AuthFormState,
} from "@/app/auth/actions";

const initialState: AuthFormState = { ok: false, message: "" };

const inputCls =
  "mt-2 w-full rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 text-sm text-[#1C1E2E] placeholder:text-[#B0B8CC] outline-none transition focus:border-[#FF4D2D] focus:bg-white";

const labelCls = "block text-xs font-semibold uppercase tracking-widest text-[#8B92A8]";

const primaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D2D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20] disabled:opacity-60";

const ghostBtn =
  "w-full text-center text-xs text-[#8B92A8] underline-offset-4 hover:text-[#1C1E2E] hover:underline transition";

export function LoginForm() {
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [state, formAction, pending] = useActionState(signInWithMagicLink, initialState);
  const [pwState, pwAction, pwPending] = useActionState(signInWithPassword, initialState);

  if (mode === "password") {
    return (
      <div className="mt-6 space-y-4">
        <form action={pwAction} className="space-y-3">
          <label className={labelCls}>
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Senha
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </label>
          <button type="submit" disabled={pwPending} className={primaryBtn}>
            {pwPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Entrar com senha
          </button>
          {pwState.message ? (
            <p className="text-xs text-red-500" role="alert">{pwState.message}</p>
          ) : null}
        </form>
        <button onClick={() => setMode("magic")} className={ghostBtn}>
          Prefiro receber um link mágico por email
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <form action={formAction} className="space-y-3">
        <label className={labelCls}>
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className={inputCls}
          />
        </label>
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Receber link mágico
        </button>
        {state.message ? (
          <p
            className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-500"}`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </form>

      <button onClick={() => setMode("password")} className={ghostBtn}>
        Entrar com email e senha
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E4EAF4]" />
        <span className="text-[10px] uppercase tracking-widest text-[#B0B8CC]">ou</span>
        <span className="h-px flex-1 bg-[#E4EAF4]" />
      </div>

      <form action={signInWithOAuth.bind(null, "google")}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4EAF4] bg-white px-4 py-3 text-sm font-medium text-[#1C1E2E] transition hover:bg-[#F8FAFD]"
        >
          <GoogleIcon />
          Continuar com Google
        </button>
      </form>

      <form action={signInWithOAuth.bind(null, "apple")}>
        <button
          type="submit"
          disabled
          title="Em breve"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 text-sm font-medium text-[#B0B8CC]"
        >
          <AppleIcon />
          Continuar com Apple
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.36 12.79c.03 3.26 2.86 4.35 2.89 4.36-.02.08-.45 1.55-1.49 3.07-.9 1.31-1.83 2.62-3.3 2.65-1.44.03-1.91-.86-3.56-.86-1.65 0-2.17.83-3.53.88-1.42.05-2.5-1.42-3.4-2.73C2.1 17.5.71 12.6 2.6 9.28c.94-1.66 2.6-2.7 4.42-2.73 1.39-.03 2.7.93 3.55.93.85 0 2.44-1.15 4.12-.98.7.03 2.67.28 3.94 2.14-.1.06-2.35 1.37-2.27 4.15ZM13.65 3.83c.75-.9 1.25-2.16 1.11-3.41-1.08.04-2.38.72-3.15 1.62-.7.8-1.3 2.09-1.14 3.32 1.2.09 2.43-.61 3.18-1.53Z" />
    </svg>
  );
}
