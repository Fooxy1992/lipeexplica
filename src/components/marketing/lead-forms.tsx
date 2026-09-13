"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/input";

type FormState = "idle" | "loading" | "ok" | "error";

/**
 * Newsletter.
 *
 * Só pede email: `name` é opcional no schema de /api/leads, então removê-lo
 * do formulário não altera o contrato da API — reduz o atrito de conversão.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "newsletter" }),
      });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-xl border border-border bg-[var(--surface-2)] px-5 py-4 text-body font-semibold text-foreground"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden />
        Inscrito! Os próximos conteúdos chegam no seu email. OSS 🥋
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-8 max-w-md text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            label="Seu email"
            hideLabel
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            error={state === "error" ? "Não deu para inscrever. Tente de novo." : undefined}
          />
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-primary w-full shrink-0 !justify-center sm:w-auto"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span className="sr-only">Enviando…</span>
            </>
          ) : (
            "Inscrever-se"
          )}
        </button>
      </div>

      <p className="mt-3 text-caption text-muted-foreground">
        Sem spam. Cancela quando quiser.
      </p>

      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" ? "Enviando inscrição…" : ""}
        {state === "error" ? "Erro ao inscrever. Tente novamente." : ""}
      </p>
    </form>
  );
}

/** Formulário de contato — captura lead source=contato. */
export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

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
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-border bg-[var(--surface-2)] p-8 text-center"
      >
        <CheckCircle2
          className="mx-auto h-8 w-8 text-[var(--brand)]"
          aria-hidden
        />
        <p className="mt-4 text-h3 text-foreground">Mensagem enviada 🥋</p>
        <p className="mt-1.5 text-body text-muted-foreground">
          Respondemos em até 48h úteis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Input label="Nome" name="name" required autoComplete="name" placeholder="Seu nome" />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="seu@email.com"
      />

      <Select label="Tipo" name="type" defaultValue="parceria">
        <option value="parceria">Parceria / Patrocínio</option>
        <option value="colaboracao">Colaboração</option>
        <option value="feedback">Feedback</option>
        <option value="outro">Outro</option>
      </Select>

      <Textarea
        label="Mensagem"
        name="message"
        required
        rows={5}
        placeholder="Conta pra gente..."
      />

      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-primary w-full !justify-center"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="sr-only">Enviando…</span>
          </>
        ) : (
          <>
            Enviar mensagem <Send className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>

      <p role="status" aria-live="polite" className="min-h-5 text-center text-caption">
        {state === "loading" ? (
          <span className="sr-only">Enviando mensagem…</span>
        ) : null}
        {state === "error" ? (
          <span className="text-[var(--destructive)]">
            Erro ao enviar. Tente novamente.
          </span>
        ) : null}
      </p>

      <p className="text-center text-caption text-muted-foreground">
        Seus dados não são compartilhados com terceiros.
      </p>
    </form>
  );
}
