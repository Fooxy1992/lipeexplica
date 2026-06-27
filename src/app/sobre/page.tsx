import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre — lipeexplica",
  description: "Conheça a história por trás do canal lipeexplica.",
};

const stats = [
  { value: "60s", label: "Por vídeo", desc: "Curtos o suficiente pra não perder o fio" },
  { value: "100%", label: "Original", desc: "Conteúdo próprio, pesquisado com cuidado" },
  { value: "∞", label: "Curiosidade", desc: "Sempre tem algo novo pra aprender" },
];

const topics = [
  { emoji: "🔬", name: "Ciência" },
  { emoji: "🧠", name: "Psicologia" },
  { emoji: "💡", name: "Curiosidades" },
  { emoji: "📜", name: "História" },
  { emoji: "⚙️", name: "Tecnologia" },
  { emoji: "🌍", name: "Filosofia" },
];

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-red mb-3 animate-fade-in-up">
              Quem somos
            </p>
            <h1
              className="text-5xl sm:text-6xl font-black text-[#fafafa] leading-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Sobre o<br />
              <span className="gradient-text">lipeexplica</span>
            </h1>
            <p
              className="text-xl text-[#71717a] leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Um canal de YouTube Shorts nascido para provar que aprender pode
              ser rápido, bonito e divertido.
            </p>
          </div>
        </div>
      </section>

      {/* Mission + Character */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Character card */}
            <div className="relative">
              <div className="absolute inset-0 bg-brand-red/10 blur-[60px] rounded-full" />
              <div className="relative gradient-card rounded-3xl p-8 flex flex-col items-center text-center gap-4">
                <div className="relative w-48 h-48 animate-float">
                  <Image
                    src="/logotipo.png"
                    alt="Personagem lipeexplica"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#fafafa] mb-2">O Personagem</h3>
                  <p className="text-[#71717a] text-sm leading-relaxed">
                    Nosso protagonista chibi de moletom vermelho — expressivo,
                    curioso, e sempre pronto pra explicar algo novo. Ele aparece
                    em cada vídeo, trazendo personalidade e consistência pra marca.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <span className="text-xs px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20">
                    Moletom Vermelho
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-[#71717a] border border-white/10">
                    Estilo Chibi
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-[#71717a] border border-white/10">
                    Traços Simples
                  </span>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#fafafa] mb-3 flex items-center gap-2">
                  <span className="text-brand-red">01</span> A Missão
                </h2>
                <p className="text-[#71717a] leading-relaxed">
                  O lipeexplica nasceu de uma ideia simples: explicar temas
                  complexos de um jeito que qualquer pessoa consiga entender —
                  em 60 segundos, com ilustrações minimalistas e histórias que prendem.
                </p>
              </div>

              <div className="section-divider" />

              <div>
                <h2 className="text-2xl font-bold text-[#fafafa] mb-3 flex items-center gap-2">
                  <span className="text-brand-red">02</span> O Estilo
                </h2>
                <p className="text-[#71717a] leading-relaxed">
                  Nossos vídeos usam ilustrações com fundo branco, traços simples
                  e um personagem chibi de moletom vermelho. A simplicidade visual
                  garante que o foco fique onde importa: na história e no conhecimento.
                </p>
              </div>

              <div className="section-divider" />

              <div>
                <h2 className="text-2xl font-bold text-[#fafafa] mb-3 flex items-center gap-2">
                  <span className="text-brand-red">03</span> Os Temas
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {topics.map((t) => (
                    <span
                      key={t.name}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#a1a1aa]"
                    >
                      {t.emoji} {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card text-center">
                <div className="text-4xl font-black text-brand-red mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-[#e4e4e7] mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[#52525b]">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/15 via-brand-orange/8 to-transparent" />
            <div className="absolute inset-0 border border-brand-red/20 rounded-3xl" />
            <div className="relative px-8 py-12 sm:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#fafafa] mb-2">
                  Viu um vídeo que gostou?
                </h2>
                <p className="text-[#71717a] text-sm">
                  Explore todos os shorts do canal.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/videos" className="btn-secondary !py-2.5 !px-6" id="sobre-videos-btn">
                  Ver Vídeos
                </Link>
                <a
                  href="https://instagram.com/lipeexplica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  id="sobre-instagram-btn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
