import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Play, ArrowRight } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { reels, INSTAGRAM_URL } from "@/data/reels";
import { NewsletterForm } from "@/components/marketing/lead-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "lipeexplica — Jiu-Jitsu explicado sem filtro",
  description:
    "Técnicas, mentalidade, evolução e histórias do tatame explicadas através de ilustrações cinematográficas que prendem sua atenção do início ao fim.",
};

const metodo = [
  { n: "1", t: "Você assiste", d: "Reels curtos e visuais que explicam o jiu-jitsu de forma clara." },
  { n: "2", t: "Entende a técnica", d: "Cada detalhe é mostrado com ilustrações cinematográficas." },
  { n: "3", t: "Leva para o tatame", d: "Conhecimento prático que você aplica no próximo treino." },
  { n: "4", t: "Evolui", d: "Progressão real, constante e fundamentada." },
];

const temas = [
  { t: "Sistema de Faixas", d: "Da branca à preta — o que cada faixa realmente significa." },
  { t: "Mentalidade", d: "O jogo mental por trás do tatame e como ele transforma." },
  { t: "História do Jiu-Jitsu", d: "Das origens japonesas ao domínio brasileiro no mundo." },
  { t: "Técnicas", d: "Guarda, passagem, finalização — detalhes visuais." },
  { t: "Competições", d: "O que ninguém te conta sobre competir no jiu-jitsu." },
  { t: "Defesa Pessoal", d: "Como o jiu-jitsu se aplica fora do tatame." },
];

/** Home — visual original do canal (dark + brand-red). */
export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const destaque = reels.slice(0, 3);

  return (
    <div className="site-dark min-h-dvh">
      <Navbar isLoggedIn={Boolean(user)} />
      <main>
        {/* Hero */}
        <section className="grid-bg relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[#FF4D2D]/10 blur-[100px]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-[#FF4D2D]">
                道義術 · Novo reel todos os dias
              </p>
              <h1
                className="animate-fade-up mt-4 text-5xl font-black leading-tight text-[#fafafa] sm:text-6xl"
                style={{ animationDelay: "0.1s" }}
              >
                Jiu-Jitsu explicado{" "}
                <span className="text-[#FF4D2D]">sem filtro.</span>
              </h1>
              <p
                className="animate-fade-up mt-5 max-w-md text-lg leading-relaxed text-[#a1a1aa]"
                style={{ animationDelay: "0.2s" }}
              >
                Técnicas, mentalidade, evolução e histórias do tatame explicadas
                através de ilustrações cinematográficas que prendem sua atenção
                do início ao fim.
              </p>
              <div
                className="animate-fade-up mt-8 flex flex-wrap gap-3"
                style={{ animationDelay: "0.3s" }}
              >
                <a
                  href={destaque[0]?.url ?? INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Play className="h-4 w-4 fill-current" /> Ver último Reel
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-site"
                >
                  Instagram
                </a>
              </div>
              <div
                className="animate-fade-up mt-10 grid max-w-md grid-cols-3 gap-4"
                style={{ animationDelay: "0.4s" }}
              >
                {[
                  ["+3.100", "Seguidores em 10 dias"],
                  ["+432K", "Visualizações"],
                  ["1/dia", "Novo reel"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-2xl font-black text-[#FF4D2D]">{v}</p>
                    <p className="mt-1 text-[11px] text-[#71717a]">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-[#FF4D2D]/10 blur-[60px]"
              />
              <div className="animate-float-y relative h-72 w-72 sm:h-96 sm:w-96">
                <Image
                  src="/logotipo.png"
                  alt="Personagem lipeexplica"
                  fill
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reels em destaque */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4D2D]">
                Conteúdo
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#fafafa]">
                Reels em Destaque
              </h2>
              <p className="mt-1 text-sm text-[#71717a]">Os mais vistos do canal</p>
            </div>
            <Link
              href="/videos"
              className="hidden items-center gap-1 text-sm font-medium text-[#a1a1aa] transition hover:text-[#fafafa] sm:inline-flex"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {destaque.map((reel) => (
              <a
                key={reel.id}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#1c1b1b] p-5"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-[#71717a]">
                  <span>Jiu-Jitsu</span>
                  <span>60s</span>
                </div>
                <div>
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#FF4D2D]/90 text-white transition group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                  <p className="text-xl font-black text-[#fafafa]">{reel.title}</p>
                  <p className="mt-1 text-xs text-[#71717a]">{reel.views} visualizações</p>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/videos" className="btn-outline-site">
              Ver todos os reels
            </Link>
          </div>
        </section>

        {/* Livro 50 Dinâmicas — produto */}
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#FF4D2D]/20 bg-gradient-to-r from-[#FF4D2D]/15 via-[#FF4D2D]/5 to-transparent px-8 py-12 sm:px-14">
            <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#ffb4a5]">
                  📕 Novo · Livro interativo
                </p>
                <h2 className="mt-2 max-w-lg text-2xl font-black text-[#fafafa] sm:text-3xl">
                  50 Dinâmicas para Jiu-Jitsu Infantil
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[#a1a1aa]">
                  Para professores: 50 dinâmicas práticas organizadas por
                  categoria, em um livro 100% interativo. Não é PDF.
                </p>
              </div>
              <Link href="/50dinamicas" className="btn-primary shrink-0">
                <BookOpen className="h-4 w-4" /> Conhecer o livro
              </Link>
            </div>
          </div>
        </section>

        {/* Método */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4D2D]">
            Método
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#fafafa]">Como aprendemos</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metodo.map((m) => (
              <div key={m.n} className="rounded-2xl border border-white/5 bg-[#1c1b1b] p-6">
                <p className="text-3xl font-black text-[#FF4D2D]/60">{m.n}</p>
                <h3 className="mt-3 font-bold text-[#fafafa]">{m.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#71717a]">{m.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Temas */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4D2D]">
            Explore
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#fafafa]">O que explicamos</h2>
          <p className="mt-1 text-sm text-[#71717a]">
            Jiu-Jitsu não é só luta. É mentalidade, evolução e história.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {temas.map((t) => (
              <div
                key={t.t}
                className="card-hover rounded-2xl border border-white/5 bg-white/[0.02] p-6"
              >
                <h3 className="font-bold text-[#fafafa]">{t.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#71717a]">{t.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sobre resumo */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF4D2D]">
                Sobre o canal
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#fafafa]">
                Quem é o lipeexplica?
              </h2>
              <div className="mt-6 space-y-5">
                {[
                  ["Missão", "Tornar o conhecimento do jiu-jitsu acessível e visual para todos os praticantes."],
                  ["Método", "Ilustrações cinematográficas e narrativa que prende do início ao fim."],
                  ["Objetivo", "Ser a maior referência visual de conteúdo sobre jiu-jitsu na internet."],
                ].map(([t, d]) => (
                  <div key={t}>
                    <h3 className="font-bold text-[#fafafa]">{t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#71717a]">{d}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/sobre"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#FF4D2D] hover:underline"
              >
                Saiba mais <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80">
              <div aria-hidden className="absolute inset-0 rounded-full bg-[#FF4D2D]/10 blur-[60px]" />
              <Image
                src="/character.png"
                alt="Personagem lipeexplica"
                fill
                className="relative object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Newsletter + CTA final */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/5 bg-[#1c1b1b] px-8 py-12 text-center">
            <h2 className="text-2xl font-black text-[#fafafa] sm:text-3xl">
              Receba novos conteúdos sobre Jiu-Jitsu
            </h2>
            <p className="mt-2 text-sm text-[#71717a]">
              Artigos, análises e conteúdo exclusivo direto no seu email.
            </p>
            <NewsletterForm />
            <p className="mt-8 text-sm text-[#71717a]">
              E não perde nenhum reel:
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-site mt-3"
            >
              Seguir no Instagram
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
