import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] to-[#0d0d10] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-brand-red/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-brand-red/20">
                <Image src="/logotipo.png" alt="lipeexplica" fill className="object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-[#fafafa]">lipe</span>
                <span className="text-brand-red">explica</span>
              </span>
            </Link>
            <p className="text-[#71717a] text-sm leading-relaxed max-w-xs">
              Explicando o mundo em 60 segundos. Temas complexos, de forma simples,
              com ilustrações minimalistas.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://youtube.com/@lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#71717a] hover:text-[#ef4444] hover:border-[#ef4444]/30 hover:bg-[#ef4444]/5 transition-all duration-200"
                aria-label="YouTube"
                id="footer-youtube-link"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#71717a] hover:text-[#e1306c] hover:border-[#e1306c]/30 hover:bg-[#e1306c]/5 transition-all duration-200"
                aria-label="Instagram"
                id="footer-instagram-link"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@lipeexplica"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#71717a] hover:text-[#fafafa] hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                aria-label="TikTok"
                id="footer-tiktok-link"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-[#52525b]">
              Navegação
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/videos", label: "Vídeos" },
                { href: "/sobre", label: "Sobre" },
                { href: "/contato", label: "Contato" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#71717a] hover:text-[#fafafa] text-sm transition-colors duration-200 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-[#52525b]">
              Contato
            </h4>
            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:itfelipehenrique@gmail.com"
                className="text-[#71717a] hover:text-brand-red text-sm transition-colors duration-200 w-fit"
              >
                itfelipehenrique@gmail.com
              </a>
              <p className="text-xs text-[#3f3f46] leading-relaxed">
                Parcerias e colaborações<br />bem-vindas!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#3f3f46] text-xs">
            © {new Date().getFullYear()} lipeexplica. Todos os direitos reservados.
          </p>
          <p className="text-[#27272a] text-xs">
            Feito com ❤️ para quem ama aprender
          </p>
        </div>
      </div>
    </footer>
  );
}
