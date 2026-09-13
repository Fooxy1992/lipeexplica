import { SectionHeader } from "@/components/ui/section-header";

const ETAPAS = [
  {
    n: "01",
    t: "Veja",
    d: "Conteúdo visual e curto que mostra o movimento em vez de descrever.",
  },
  {
    n: "02",
    t: "Entenda",
    d: "O porquê de cada detalhe — o que muda quando o quadril vai para o outro lado.",
  },
  {
    n: "03",
    t: "Pratique",
    d: "Conhecimento que cabe no próximo treino, não na teoria.",
  },
  {
    n: "04",
    t: "Evolua",
    d: "Progressão real, ligada ao sistema de faixas e ao seu momento.",
  },
];

/** "Como aprendemos" — método em 4 passos, com conector visual. */
export function MetodoSection() {
  return (
    <section
      aria-labelledby="home-metodo"
      className="border-y border-border bg-[color-mix(in_oklab,var(--surface-1)_55%,transparent)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          id="home-metodo"
          eyebrow="Método"
          title="Como aprendemos"
          description="Quatro passos que se repetem em todo conteúdo do canal."
        />

        <ol className="relative mt-12 grid gap-8 lg:grid-cols-4 lg:gap-6">
          {/* Conector: linha vertical no mobile, horizontal no desktop. */}
          <span
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[color-mix(in_oklab,var(--brand)_50%,transparent)] via-border to-transparent lg:left-0 lg:right-0 lg:top-[19px] lg:bottom-auto lg:h-px lg:w-auto lg:bg-gradient-to-r"
          />

          {ETAPAS.map((etapa) => (
            <li key={etapa.n} className="relative flex gap-5 lg:flex-col lg:gap-0">
              <span
                aria-hidden
                className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color-mix(in_oklab,var(--brand)_40%,transparent)] bg-[var(--background)] text-small font-black text-[var(--brand)]"
              >
                {etapa.n}
              </span>

              <div className="lg:mt-6">
                <h3 className="text-h3 text-foreground">
                  <span className="sr-only">Passo {etapa.n}: </span>
                  {etapa.t}
                </h3>
                <p className="mt-2 text-body text-muted-foreground">{etapa.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
