import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato — lipeexplica",
  description: "Entre em contato para parcerias e colaborações com lipeexplica.",
};

export default function ContatoPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Contato</h1>
        <p className="text-gray-500 mb-10">
          Quer fazer uma parceria, colaboração, ou só dizer oi? Manda mensagem.
        </p>

        <form
          action="https://formspree.io/f/placeholder"
          method="POST"
          className="space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-sm"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-sm bg-white"
            >
              <option value="parceria">Parceria / Patrocínio</option>
              <option value="colaboracao">Colaboração</option>
              <option value="feedback">Feedback</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all text-sm resize-none"
              placeholder="Conta pra gente..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-red text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-red-dark transition-colors"
          >
            Enviar Mensagem
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            Ou mande direto:{" "}
            <a href="mailto:itfelipehenrique@gmail.com" className="text-brand-red hover:text-brand-red-dark font-medium">
              itfelipehenrique@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
