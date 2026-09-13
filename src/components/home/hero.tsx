import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const NUMEROS = [
  { valor: "+3.100", rotulo: "Seguidores no IG" },
  { valor: "+432K", rotulo: "Visualizações" },
  { valor: "1/sem.", rotulo: "Novo conteúdo" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-titulo">
      {/* ── Background layers ─────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Dot grid */}
        <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:26px_26px]" />
        {/* Brand glow — top right */}
        <div className="absolute -right-32 -top-32 h-[640px] w-[640px] rounded-full bg-[color-mix(in_oklab,var(--brand)_13%,transparent)] blur-[130px]" />
        {/* Subtle glow — bottom left */}
        <div className="absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-[color-mix(in_oklab,var(--brand)_6%,transparent)] blur-[100px]" />
        {/* Vignette — bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-0 lg:py-28 lg:px-8">

        {/* ── LEFT — copy ───────────────────────────────────────────── */}
        <div className="lg:pr-10">
          <p className="animate-fade-up text-label text-[var(--brand)]">
            CONHECIMENTO · DISCIPLINA · EVOLUÇÃO
          </p>

          <h1
            id="hero-titulo"
            className="animate-fade-up mt-5 text-hero uppercase"
            style={{ animationDelay: "0.08s" }}
          >
            <span className="block text-foreground">Jiu-Jitsu</span>
            <span className="block text-[var(--brand)]">sem enrolação.</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-[480px] text-body-lg text-muted-foreground"
            style={{ animationDelay: "0.18s" }}
          >
            Técnica, mentalidade, história e conhecimento
            para quem quer entender o Jiu-Jitsu de verdade.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "0.26s" }}
          >
            <Link href="/aprender" className="btn-primary">
              Começar a aprender
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/sobre" className="btn-outline-site">
              Conhecer o Lipe
            </Link>
          </div>

          {/* Stats — horizontal com divisor */}
          <dl
            className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-8"
            style={{ animationDelay: "0.34s" }}
          >
            {NUMEROS.map((n, i) => (
              <div key={n.rotulo} className="flex items-center gap-6">
                <div>
                  <dt className="sr-only">{n.rotulo}</dt>
                  <dd className="flex flex-col">
                    <span className="text-[1.4rem] font-black leading-none tracking-tight text-[var(--brand)]">
                      {n.valor}
                    </span>
                    <span className="mt-0.5 text-caption text-muted-foreground">
                      {n.rotulo}
                    </span>
                  </dd>
                </div>
                {i < NUMEROS.length - 1 && (
                  <span aria-hidden className="h-8 w-px bg-border" />
                )}
              </div>
            ))}
          </dl>
        </div>

        {/* ── RIGHT — character ─────────────────────────────────────── */}
        <div className="relative mt-10 flex justify-center lg:mt-0 lg:justify-end">
          {/* Glow behind character */}
          <div
            aria-hidden
            className="absolute inset-0 mx-auto w-4/5 rounded-full bg-[color-mix(in_oklab,var(--brand)_18%,transparent)] blur-[80px]"
          />

          {/* Decorative diagonal watermark */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-8 hidden select-none -rotate-90 origin-top-right whitespace-nowrap text-[0.55rem] font-black uppercase tracking-[0.5em] text-foreground/10 lg:block"
          >
            Disciplina Transforma
          </span>

          {/* Secondary label */}
          <p
            aria-hidden
            className="absolute bottom-4 right-0 hidden max-w-[100px] text-right text-[0.6rem] font-bold uppercase leading-snug tracking-widest text-foreground/25 lg:block"
          >
            Mais que<br />técnicas,<br />uma melhor<br />versão de você.
          </p>

          <div className="relative h-72 w-72 sm:h-[400px] sm:w-[400px] lg:h-[460px] lg:w-[460px]">
            <Image
              src="/mascote.webp"
              alt="Mascote do LipeExplica — personagem com moletom vermelho apontando para cima"
              fill
              priority
              sizes="(max-width: 640px) 288px, (max-width: 1024px) 400px, 460px"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
