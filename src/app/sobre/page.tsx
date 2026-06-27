import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre — lipeexplica",
  description: "Conheça a história por trás do canal lipeexplica.",
};

export default function SobrePage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Sobre</h1>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">A Missão</h2>
            <p>
              O lipeexplica nasceu de uma ideia simples: explicar temas complexos
              de um jeito que qualquer pessoa consiga entender — em 60 segundos,
              com ilustrações minimalistas e histórias que prendem.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">O Estilo</h2>
            <p>
              Nossos vídeos usam ilustrações com fundo branco, traços simples
              e um personagem chibi de moletom vermelho. A simplicidade visual
              garante que o foco fique onde importa: na história e no conhecimento.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">O Personagem</h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
              <Image
                src="/character.png"
                alt="Personagem lipeexplica"
                width={200}
                height={200}
                className="rounded-xl"
              />
              <p>
                Nosso protagonista é um personagem chibi com moletom vermelho e cabelo
                preto — expressivo, curioso, e sempre pronto pra explicar algo novo. Ele
                aparece em cada vídeo, trazendo personalidade e consistência pra marca.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Os Temas</h2>
            <p>
              Exploramos ciência, psicologia, curiosidades, história, e tudo que desperta
              curiosidade. Cada vídeo é pesquisado, roteirizado, e produzido para maximizar
              retenção e aprendizado.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Números</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { value: "60s", label: "Por vídeo" },
                { value: "100%", label: "Conteúdo original" },
                { value: "∞", label: "Curiosidade" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <div className="text-2xl font-black text-brand-red">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
