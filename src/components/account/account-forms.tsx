"use client";

import { useActionState, useState } from "react";
import { Loader2, Save, KeyRound, CreditCard } from "lucide-react";
import {
  updateProfile,
  setPassword,
  type AccountFormState,
} from "@/app/conta/actions";

const initialState: AccountFormState = { ok: false, message: "" };

const inputCls =
  "mt-2 w-full rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 text-sm text-[#1C1E2E] placeholder:text-[#B0B8CC] outline-none transition focus:border-[#FF4D2D] focus:bg-white";

const labelCls =
  "block text-xs font-semibold uppercase tracking-widest text-[#8B92A8]";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4D2D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20] disabled:opacity-60";

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4EAF4] bg-white px-5 py-3 text-sm font-semibold text-[#1C1E2E] transition hover:border-[#FF4D2D]/40 disabled:opacity-60";

function FormMessage({ state }: { state: AccountFormState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-500"}`}
    >
      {state.message}
    </p>
  );
}

export function ProfileForm({
  name,
  phone,
}: {
  name: string | null;
  phone: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Nome
          <input
            type="text"
            name="name"
            required
            defaultValue={name ?? ""}
            autoComplete="name"
            placeholder="Seu nome completo"
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Telefone (WhatsApp)
          <input
            type="tel"
            name="phone"
            defaultValue={phone ?? ""}
            autoComplete="tel"
            placeholder="+55 11 98888-7777"
            className={inputCls}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar alterações
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(setPassword, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Senha
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
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
            placeholder="Repita a senha"
            className={inputCls}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={secondaryBtn}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          Salvar senha
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Opens the Stripe Customer Portal for the signed-in subscriber. */
export function ManageSubscriptionButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? "Não foi possível abrir o portal.");
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={openPortal}
        disabled={pending}
        className={secondaryBtn}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        Gerenciar assinatura
      </button>
      {error ? (
        <p role="status" className="text-xs text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
