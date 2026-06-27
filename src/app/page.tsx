import Image from "next/image";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import { videos } from "@/data/videos";

export default function Home() {
  const featured = videos.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-gray-900 animate-fade-in-up">
                <span className="text-gray-900">lipe</span>
                <span className="text-brand-red">explica</span>
              </h1>
              <p className="mt-4 text-xl sm:text-2xl font-medium text-gray-500 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Explicando o mundo em 60 segundos.
              </p>
              <p className="mt-6 text-lg text-gray-600 max-w-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Temas complexos explicados de forma simples, com ilustrações
                minimalistas e histórias que prendem do início ao fim.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center md:items-start gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <a
                  href="https://youtube.com/@lipeexplica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-red text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-red-dark transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Assistir no YouTube
                </a>
                <Link
                  href="/videos"
                  className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  Ver Todos os Vídeos
                </Link>
              </div>
            </div>

            {/* Character */}
            <div className="flex-shrink-0 animate-float">
              <Image
                src="/character.png"
                alt="Personagem lipeexplica"
                width={320}
                height={320}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Vídeos em Destaque</h2>
              <p className="text-gray-500 mt-2">Nossos shorts mais populares</p>
            </div>
            <Link
              href="/videos"
              className="hidden sm:inline-flex text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors"
            >
              Ver todos →
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
              className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors"
            >
              Ver todos os vídeos →
            </Link>
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Quem é o lipeexplica?</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Um canal de YouTube Shorts que transforma curiosidade em conhecimento.
              Cada vídeo é uma jornada de 60 segundos com ilustrações minimalistas,
              narração envolvente, e aquele personagem de moletom vermelho que você
              já conhece.
            </p>
            <Link
              href="/sobre"
              className="inline-block mt-8 text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors"
            >
              Saiba mais →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
