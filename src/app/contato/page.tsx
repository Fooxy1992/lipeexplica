import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato — lipeexplica",
  description: "Entre em contato para parcerias e colaborações com lipeexplica.",
};

const contactOptions = [
  {
    icon: "🤝",
    title: "Parcerias",
    desc: "Marcas e produtos que fazem sentido pra nossa audiência.",
  },
  {
    icon: "🎬",
    title: "Colaborações",
    desc: "Outros criadores que querem criar algo juntos.",
  },
  {
    icon: "💌",
    title: "Feedback",
    desc: "Sugestões de temas, críticas, ou só um oi.",
  },
];

export default function ContatoPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-red mb-3 animate-fade-in-up">
              Fale conosco
            </p>
            <h1
              className="text-5xl sm:text-6xl font-black text-[#fafafa] leading-tight mb-4 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Contato
            </h1>
            <p
              className="text-xl text-[#71717a] leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Quer fazer uma parceria, colaboração, ou só dizer oi?{" "}
              <span className="text-[#a1a1aa]">Manda mensagem.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Info */}
            <div>
              <h2 className="text-xl font-bold text-[#fafafa] mb-6">
                Como posso ajudar?
              </h2>
              <div className="space-y-4 mb-10">
                {contactOptions.map((opt) => (
                  <div
                    key={opt.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#e4e4e7] mb-1">{opt.title}</h3>
                      <p className="text-sm text-[#52525b]">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct email */}
              <div className="p-5 rounded-2xl bg-brand-red/5 border border-brand-red/15">
                <p className="text-sm text-[#71717a] mb-2">Email direto:</p>
                <a
                  href="mailto:itfelipehenrique@gmail.com"
                  className="text-base font-semibold text-brand-red hover:text-brand-red-light transition-colors break-all"
                  id="contact-email-link"
                >
                  itfelipehenrique@gmail.com
                </a>
                <p className="text-xs text-[#3f3f46] mt-2">
                  Respondemos em até 48h úteis.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <form
                action="https://formspree.io/f/placeholder"
                method="POST"
                className="space-y-5"
                id="contact-form"
              >
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="form-input"
                    placeholder="Seu nome"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    Tipo
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="form-input"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="parceria">Parceria / Patrocínio</option>
                    <option value="colaboracao">Colaboração</option>
                    <option value="feedback">Feedback</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="form-input resize-none"
                    placeholder="Conta pra gente..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full justify-center"
                  id="contact-submit-btn"
                >
                  Enviar Mensagem
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>

                <p className="text-center text-xs text-[#3f3f46]">
                  Seus dados não são compartilhados com terceiros.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
