import type { Metadata } from "next";
import { PageHeader } from "@/components/content/page-header";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a história por trás do canal lipeexplica.",
};

const blocos = [
  {
    numero: "01",
    titulo: "A Ideia",
    texto:
      "Criar conteúdo de Jiu-Jitsu com narrativa visual e cinematográfica — algo que ainda não existia no mercado. Não era só sobre explicar técnicas, era sobre contar histórias que prendem.",
  },
  {
    numero: "02",
    titulo: "O Método",
    texto:
      "Cada reel é uma mini-história. Roteiro pensado, narração envolvente e ilustrações originais — sem templates, sem genérico. Cada frame existe por um motivo.",
  },
  {
    numero: "03",
    titulo: "O Objetivo",
    texto:
      "Ser a maior referência de conteúdo visual sobre Jiu-Jitsu na internet. Não apenas mais um canal — mas O canal que as pessoas recomendam quando alguém pergunta 'onde eu aprendo sobre isso?'",
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre"
        title="Quem é o lipeexplica?"
        subtitle="Um canal que nasceu pra contar a história do Jiu-Jitsu de um jeito que ninguém fazia — com narrativa visual, ilustrações cinematográficas e verdade."
      />
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--gold)_40%,transparent)] bg-[color-mix(in_oklab,var(--gold)_10%,transparent)] p-6 text-center">
          <p className="font-display text-lg font-semibold">
            Em menos de 10 dias: +3.100 seguidores e +432 mil visualizações.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            A comunidade do Jiu-Jitsu queria esse conteúdo — só faltava alguém fazer.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {blocos.map((b) => (
            <div key={b.numero} className="flex gap-5">
              <span className="font-display text-3xl font-semibold text-[var(--royal)]">
                {b.numero}
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold">{b.titulo}</h2>
                <p className="mt-2 leading-relaxed text-foreground/85">{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
