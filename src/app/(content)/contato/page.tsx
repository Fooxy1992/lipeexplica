import type { Metadata } from "next";
import { Handshake, Clapperboard, Mail } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { CONTACT_EMAIL } from "@/data/reels";
import { ContactForm } from "@/components/marketing/lead-forms";

export const metadata: Metadata = {
  title: "Contato",
  description: "Entre em contato para parcerias e colaborações com lipeexplica.",
};

const opcoes = [
  {
    icon: Handshake,
    titulo: "Parcerias",
    texto: "Marcas e produtos que fazem sentido pra nossa audiência.",
  },
  {
    icon: Clapperboard,
    titulo: "Colaborações",
    texto: "Outros criadores que querem criar algo juntos.",
  },
  {
    icon: Mail,
    titulo: "Feedback",
    texto: "Sugestões de temas, críticas, ou só um oi.",
  },
];

export default function ContatoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fale conosco"
        title="Contato"
        subtitle="Quer fazer uma parceria, colaboração, ou só dizer oi? Manda mensagem."
      />
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="space-y-4">
              {opcoes.map((o) => (
                <div key={o.titulo} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--royal)_12%,transparent)] text-[var(--royal)]">
                    <o.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">{o.titulo}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {o.texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[color-mix(in_oklab,var(--royal)_35%,transparent)] bg-[color-mix(in_oklab,var(--royal)_8%,transparent)] p-6">
              <p className="text-sm text-muted-foreground">Email direto:</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 block font-display text-xl font-semibold text-[var(--royal)] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Respondemos em até 48h úteis.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
