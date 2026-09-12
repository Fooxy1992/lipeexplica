"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Loader2, Ticket } from "lucide-react";
import { redeemInvite, type RedeemState } from "@/app/convite/actions";

const initialState: RedeemState = { ok: false, message: "" };

const COUNTRY_CODES = [
  { code: "+55",  flag: "🇧🇷", label: "+55" },
  { code: "+351", flag: "🇵🇹", label: "+351" },
  { code: "+1",   flag: "🇺🇸", label: "+1" },
  { code: "+54",  flag: "🇦🇷", label: "+54" },
  { code: "+598", flag: "🇺🇾", label: "+598" },
  { code: "+595", flag: "🇵🇾", label: "+595" },
  { code: "+57",  flag: "🇨🇴", label: "+57" },
];

const inputCls =
  "mt-2 w-full rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 text-sm text-[#1C1E2E] placeholder:text-[#B0B8CC] outline-none transition focus:border-[#FF4D2D] focus:bg-white";

const labelCls =
  "block text-xs font-semibold uppercase tracking-widest text-[#8B92A8]";

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-2">
      <input
        type={show ? "text" : "password"}
        name={name}
        required
        minLength={6}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 pr-11 text-sm text-[#1C1E2E] placeholder:text-[#B0B8CC] outline-none transition focus:border-[#FF4D2D] focus:bg-white"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B8CC] transition hover:text-[#8B92A8]"
        tabIndex={-1}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function RedeemForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(redeemInvite, initialState);
  const [matchError, setMatchError] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);

  if (state.ok) {
    return (
      <div className="mt-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <p className="mt-4 font-display text-xl font-bold text-[#1C1E2E]">
          Acesso liberado! 🥋
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#8B92A8]">
          Sua conta é <strong className="text-[#1C1E2E]">{state.email}</strong>.
          Entre para abrir sua biblioteca.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-[#FF4D2D] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20]"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const pw = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    if (pw !== confirm) {
      e.preventDefault();
      setMatchError("As senhas não coincidem.");
      return;
    }
    setMatchError("");
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-6 space-y-3">
      <input type="hidden" name="token" value={token} />

      <label className={labelCls}>
        Seu nome
        <input name="name" required placeholder="Nome completo" className={inputCls} />
      </label>

      <label className={labelCls}>
        Seu email
        <input type="email" name="email" required placeholder="voce@exemplo.com" className={inputCls} />
      </label>

      <label className={labelCls}>
        Crie uma senha
        <PasswordInput name="password" placeholder="Mínimo 6 caracteres" />
      </label>

      <label className={labelCls}>
        Confirme a senha
        <PasswordInput name="confirmPassword" placeholder="Repita a senha" />
      </label>

      {matchError ? (
        <p className="text-xs text-red-500" role="alert">{matchError}</p>
      ) : null}

      {/* WhatsApp opt-in */}
      <div className="space-y-3 pt-1">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="whatsapp_opt_in"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#E4EAF4] accent-[#FF4D2D]"
          />
          <span className="text-xs leading-relaxed text-[#8B92A8]">
            Aceita participar do grupo do WhatsApp do LipeExplica?
          </span>
        </label>

        {whatsappOptIn && (
          <div className="flex gap-2">
            <select
              name="phone_code"
              defaultValue="+55"
              className="shrink-0 rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-3 py-3 text-sm text-[#1C1E2E] outline-none transition focus:border-[#FF4D2D] [&>option]:bg-white [&>option]:text-[#1C1E2E]"
            >
              {COUNTRY_CODES.map(({ code, flag, label }) => (
                <option key={code} value={code}>
                  {flag} {label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="phone_number"
              required
              placeholder="(11) 99999-9999"
              className="min-w-0 flex-1 rounded-xl border border-[#E4EAF4] bg-[#F8FAFD] px-4 py-3 text-sm text-[#1C1E2E] placeholder:text-[#B0B8CC] outline-none transition focus:border-[#FF4D2D] focus:bg-white"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D2D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e03e20] disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Ticket className="h-4 w-4" />
        )}
        Liberar meu acesso
      </button>

      {!state.ok && state.message ? (
        <p className="text-xs text-red-500" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
