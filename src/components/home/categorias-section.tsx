import { SectionHeader } from "@/components/ui/section-header";
import { CategoryCard } from "@/components/content/category-card";
import { categorias } from "@/data/categorias";

/** "O que você quer aprender?" — a porta de entrada do conteúdo. */
export function CategoriasSection() {
  return (
    <section
      aria-labelledby="home-categorias"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <SectionHeader
        id="home-categorias"
        eyebrow="Explore o conteúdo"
        title="O que você quer aprender?"
        description="Escolha um assunto e mergulhe no universo do Jiu-Jitsu."
        action={{ href: "/aprender", label: "Ver todas as categorias" }}
      />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((categoria) => (
          <li key={categoria.slug} className="flex">
            <CategoryCard categoria={categoria} className="w-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
