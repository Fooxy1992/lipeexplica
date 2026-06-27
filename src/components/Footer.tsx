import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-black mb-2">
              <span className="text-white">lipe</span>
              <span className="text-brand-red">explica</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Explicando o mundo em 60 segundos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">
              Navegação
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-300 hover:text-brand-red text-sm transition-colors">Home</Link>
              <Link href="/videos" className="text-gray-300 hover:text-brand-red text-sm transition-colors">Vídeos</Link>
              <Link href="/sobre" className="text-gray-300 hover:text-brand-red text-sm transition-colors">Sobre</Link>
              <Link href="/contato" className="text-gray-300 hover:text-brand-red text-sm transition-colors">Contato</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">
              Redes Sociais
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://youtube.com/@lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-red text-sm transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://instagram.com/lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-red text-sm transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com/@lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-red text-sm transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} lipeexplica. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
