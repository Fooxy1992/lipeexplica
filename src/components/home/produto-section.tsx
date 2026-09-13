import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { BookCover3D } from "@/components/marketing/book-cover-3d";

const DESTAQUES = [
  "50 dinâmicas organizadas por categoria",
  "Livro 100% interativo — não é PDF",
  "Pronto para usar na próxima aula",
];

/**
 * Bloco do produto "50 Dinâmicas" na Home.
 * Usa `--brand-deep` como fundo para se separar do resto da página sem
 * introduzir cor nova. O dourado continua exclusivo de /50dinamicas.
 */
export function ProdutoSection() {
  return (
    <section aria-labelledby="home-produto" className="px-4 py-20 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--brand)_25%,transparent)] px-6 py-14 sm:px-12"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-deep) 0%, color-mix(in oklab, var(--brand-deep) 45%, var(--background)) 55%, var(--background) 100%)",
        }}
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="text-label text-[color-mix(in_oklab,var(--brand)_70%,white)]">
              Para professores
            </p>

            <h2
              id="home-produto"
              className="mt-3 text-h2 text-foreground"
            >
              50 Dinâmicas para Jiu-Jitsu Infantil
            </h2>

            <p className="measure mt-4 text-body-lg text-[color-mix(in_oklab,var(--foreground)_78%,transparent)]">
              Um livro interativo com dinâmicas práticas para quem dá aula para
              crianças e cansou de improvisar o aquecimento.
            </p>

            <ul className="mt-7 flex flex-col gap-3">
              {DESTAQUES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-body text-foreground">
                  <Check
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/50dinamicas" className="btn-primary mt-9">
              Conhecer o livro
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="lg:pl-6">
            <BookCover3D />
          </div>
        </div>
      </div>
    </section>
  );
}
