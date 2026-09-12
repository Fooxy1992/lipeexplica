"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

/** Formulário de newsletter (home) — captura lead com nome + email. */
export function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "newsletter" }),
      });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <p className="mt-6 text-sm font-semibold text-emerald-400">
        Inscrito{name ? `, ${name.split(" ")[0]}` : ""}! Você vai receber os
        próximos conteúdos. OSS 🥋
      </p>
    );
  }

  const inputCls =
    "w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none transition focus:border-[#FF4D2D]/60";

  return (
    <form onSubmit={submit} className="mx-auto mt-6 max-w-md space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          className={inputCls}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={inputCls}
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-primary w-full !justify-center"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Inscrever-se"
        )}
      </button>
      {state === "error" ? (
        <p className="text-xs text-red-400">Erro — tente de novo.</p>
      ) : null}
    </form>
  );
}

/** Formulário de contato — captura lead source=contato. */
export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contato",
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          message: `[${String(fd.get("type") ?? "outro")}] ${String(fd.get("message") ?? "")}`,
        }),
      });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <p className="font-bold text-emerald-400">Mensagem enviada! 🥋</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Respondemos em até 48h úteis.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-[#FF4D2D]/60";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Nome
        </label>
        <input id="name" name="name" required placeholder="Seu nome" className={inputCls} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Email
        </label>
        <input id="email" name="email" type="email" required placeholder="seu@email.com" className={inputCls} />
      </div>
      <div>
        <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Tipo
        </label>
        <select id="type" name="type" className={inputCls}>
          <option value="parceria">Parceria / Patrocínio</option>
          <option value="colaboracao">Colaboração</option>
          <option value="feedback">Feedback</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Conta pra gente..."
          className={`${inputCls} resize-none`}
        />
      </div>
      <button type="submit" disabled={state === "loading"} className="btn-primary w-full !justify-center">
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Enviar Mensagem <Send className="h-4 w-4" />
          </>
        )}
      </button>
      {state === "error" ? (
        <p className="text-center text-xs text-red-400">Erro ao enviar — tente novamente.</p>
      ) : null}
      <p className="text-center text-xs text-muted-foreground">
        Seus dados não são compartilhados com terceiros.
      </p>
    </form>
  );
}
