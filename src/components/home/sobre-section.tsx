import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const PILARES = [
  {
    t: "Missão",
    d: "Tornar o conhecimento do Jiu-Jitsu acessível e visual para quem treina.",
  },
  {
    t: "Método",
    d: "Ilustração cinematográfica e narrativa que prende do início ao fim.",
  },
  {
    t: "Objetivo",
    d: "Ser a maior referência visual de conteúdo sobre Jiu-Jitsu na internet.",
  },
];

/** "Quem é o LipeExplica?" — o personagem mantém o protagonismo. */
export function SobreSection() {
  return (
    <section
      aria-labelledby="home-sobre"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-label text-[var(--brand)]">Sobre o canal</p>

          <h2 id="home-sobre" className="mt-3 text-h2 text-foreground">
            Quem é o LipeExplica?
          </h2>

          <dl className="mt-8 flex flex-col gap-6">
            {PILARES.map((p) => (
              <div key={p.t}>
                <dt className="text-h3 text-foreground">{p.t}</dt>
                <dd className="mt-1.5 text-body text-muted-foreground">{p.d}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/sobre"
            className="group mt-9 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-[var(--brand)]"
          >
            Conhecer o Lipe
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] blur-[60px]"
          />
          <Image
            src="/character.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 256px, 320px"
            className="relative object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
