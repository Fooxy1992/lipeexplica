import Image from "next/image";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import { videos } from "@/data/videos";

const stats = [
  { value: "60s", label: "Por vídeo", icon: "⏱️" },
  { value: "100%", label: "Original", icon: "✨" },
  { value: "∞", label: "Curiosidade", icon: "🧠" },
];

const topics = ["Ciência", "Psicologia", "Curiosidades", "História", "Filosofia", "Tecnologia"];

export default function Home() {
  const featured = videos.slice(0, 3);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden gradient-bg-hero min-h-[calc(100vh-64px)] flex items-center">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-orange/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm font-medium mb-8 animate-fade-in-up"
                style={{ animationDelay: "0s" }}
              >
                <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                Instagram · Novo vídeo todos os dias
              </div>

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="text-[#fafafa]">lipe</span>
                <span className="gradient-text">explica</span>
              </h1>

              <p
                className="mt-5 text-xl sm:text-2xl font-semibold text-[#a1a1aa] animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                Explicando o mundo em{" "}
                <span className="text-[#fafafa]">60 segundos</span>.
              </p>

              <p
                className="mt-5 text-[#71717a] text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up"
                style={{ animationDelay: "0.25s" }}
              >
                Temas complexos explicados de forma simples, com ilustrações
                minimalistas e histórias que prendem do início ao fim.
              </p>

              {/* Topic pills */}
              <div
                className="flex flex-wrap justify-center lg:justify-start gap-2 mt-6 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                {topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#71717a]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div
                className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.35s" }}
              >
                <a
                  href="https://instagram.com/lipeexplica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary animate-pulse-glow"
                  id="hero-instagram-btn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Assistir no Instagram
                </a>
                <Link href="/videos" className="btn-secondary" id="hero-videos-btn">
                  Ver Todos os Vídeos
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Stats row */}
              <div
                className="flex items-center justify-center lg:justify-start gap-8 mt-12 animate-fade-in-up"
                style={{ animationDelay: "0.45s" }}
              >
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-black text-[#fafafa]">{s.value}</div>
                    <div className="text-xs text-[#52525b] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Character */}
            <div
              className="flex-shrink-0 relative animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Glow behind character */}
              <div className="absolute inset-0 bg-brand-red/20 blur-[60px] rounded-full scale-75" />
              <div className="relative animate-float">
                <Image
                  src="/logotipo.png"
                  alt="Personagem lipeexplica"
                  width={360}
                  height={360}
                  className="drop-shadow-2xl relative z-10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#3f3f46] animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="border-y border-white/5 bg-white/[0.02] py-4 overflow-hidden">
        <div className="ticker-content gap-12">
          {[...topics, ...topics].map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 text-sm font-medium text-[#52525b] px-6"
            >
              <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED VIDEOS ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-red mb-2">
                Conteúdo
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa]">
                Vídeos em Destaque
              </h2>
              <p className="text-[#71717a] mt-2">Nossos shorts mais populares</p>
            </div>
            <Link
              href="/videos"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#71717a] hover:text-brand-red transition-colors"
              id="featured-view-all-btn"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {featured.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/videos"
              className="btn-secondary !py-2.5 !px-6 !text-sm inline-flex"
            >
              Ver todos os vídeos →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="section-divider mx-auto max-w-6xl" />

      {/* ─── ABOUT SNIPPET ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-red mb-2">
                Sobre o canal
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] mb-6">
                Quem é o lipeexplica?
              </h2>
              <p className="text-[#71717a] leading-relaxed text-lg mb-6">
                Um canal de YouTube Shorts que transforma curiosidade em conhecimento.
                Cada vídeo é uma jornada de 60 segundos com ilustrações minimalistas,
                narração envolvente, e aquele personagem de moletom vermelho que você
                já conhece.
              </p>
              <Link
                href="/sobre"
                className="btn-secondary inline-flex !py-2.5 !px-6"
                id="about-learn-more-btn"
              >
                Saiba mais
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right: feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎬", title: "Vídeos Curtos", desc: "60 segundos que prendem do início ao fim" },
                { icon: "🎨", title: "Arte Minimalista", desc: "Ilustrações limpas que reforçam a mensagem" },
                { icon: "🧠", title: "Temas Variados", desc: "Ciência, psicologia, história e muito mais" },
                { icon: "🔴", title: "O Personagem", desc: "Chibi de moletom vermelho que você já conhece" },
              ].map((item) => (
                <div key={item.title} className="stat-card">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-sm font-bold text-[#e4e4e7] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#52525b] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 via-brand-orange/10 to-transparent" />
            <div className="absolute inset-0 border border-brand-red/20 rounded-3xl" />
            <div className="relative px-8 py-12 sm:px-16 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#fafafa] mb-2">
                  Inscreva-se no canal
                </h2>
                <p className="text-[#71717a]">
                  Novo vídeo todos os dias. Não perca nenhum!
                </p>
              </div>
              <a
                href="https://instagram.com/lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-shrink-0"
                id="cta-subscribe-btn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Seguir no Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
