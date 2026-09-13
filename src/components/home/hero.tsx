import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const NUMEROS = [
  { valor: "+432K", rotulo: "Visualizações" },
  { valor: "+3.100", rotulo: "Seguidores" },
  { valor: "1/dia", rotulo: "Novo conteúdo" },
];

/**
 * Abertura da Home.
 * O caminho primário é aprender — o Instagram é secundário e vive no header
 * e no rodapé, não aqui.
 */
export function Hero() {
  return (
    <section className="grid-bg relative overflow-hidden" aria-labelledby="hero-titulo">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] blur-[100px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <div>
          <p className="animate-fade-up text-label text-[var(--brand)]">
            道義術 · Jiu-Jitsu explicado
          </p>

          <h1
            id="hero-titulo"
            className="animate-fade-up mt-4 text-display text-foreground"
            style={{ animationDelay: "0.1s" }}
          >
            Jiu-Jitsu sem
            <br />
            <span className="text-[var(--brand)]">enrolação.</span>
          </h1>

          <p
            className="animate-fade-up measure mt-6 text-body-lg text-muted-foreground"
            style={{ animationDelay: "0.2s" }}
          >
            Técnicas, mentalidade, história e evolução explicadas de forma
            visual e direta — do primeiro dia de faixa branca ao que ninguém te
            conta sobre a preta.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/aprender" className="btn-primary">
              Começar a aprender
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/sobre" className="btn-outline-site">
              Conhecer o Lipe
            </Link>
          </div>

          <dl
            className="animate-fade-up mt-12 grid max-w-md grid-cols-3 gap-4"
            style={{ animationDelay: "0.4s" }}
          >
            {NUMEROS.map((n) => (
              <div
                key={n.rotulo}
                className="rounded-2xl border border-border bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)] p-4"
              >
                <dt className="sr-only">{n.rotulo}</dt>
                <dd>
                  <span className="block text-2xl font-black tracking-[-0.02em] text-[var(--brand)]">
                    {n.valor}
                  </span>
                  <span aria-hidden className="mt-1 block text-caption text-muted-foreground">
                    {n.rotulo}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] blur-[60px]"
          />
          <div className="relative h-72 w-72 sm:h-96 sm:w-96">
            <Image
              src="/character.webp"
              alt="Lipe, o personagem que explica o Jiu-Jitsu no canal LipeExplica"
              fill
              priority
              sizes="(max-width: 640px) 288px, 384px"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
