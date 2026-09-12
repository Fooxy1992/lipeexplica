"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    q: "O livro é um PDF?",
    a: "Não. É uma aplicação web interativa: páginas que viram, índice navegável, busca por dinâmica, favoritos e progresso sincronizado entre dispositivos. Você acessa em lipeexplica.com/library — sem instalar nada.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim — foi desenhado primeiro para celular, para você usar na beira do tatame. Também funciona em tablet e computador, com progresso sincronizado automaticamente.",
  },
  {
    q: "Precisa instalar algum aplicativo?",
    a: "Não. Tudo funciona no navegador do seu celular ou computador. Sem download, sem instalação, sem atualização manual.",
  },
  {
    q: "Como recebo o acesso após a compra?",
    a: "Assim que o pagamento é aprovado, você recebe um email e uma mensagem no WhatsApp com o link da biblioteca. O login é feito com o mesmo email da compra — via link mágico, Google ou Apple.",
  },
  {
    q: "É pagamento único ou assinatura?",
    a: "O plano 'Livro completo' é pagamento único, acesso vitalício. O plano 'Livro + Grupo WhatsApp' inclui também o grupo de dinâmicas semanais — neste caso há uma mensalidade baixa para manter o grupo ativo.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "Acesso vitalício. Comprou uma vez, é seu para sempre, incluindo todas as atualizações de conteúdo que forem adicionadas.",
  },
  {
    q: "Recebo atualizações de conteúdo?",
    a: "Sim. Novas dinâmicas são adicionadas periodicamente. Quem adquiriu o livro recebe automaticamente. Quem tem o plano com Grupo WhatsApp recebe também as dinâmicas bônus enviadas diretamente no grupo.",
  },
  {
    q: "Serve para Karatê, Judô ou Taekwondo?",
    a: "As dinâmicas foram desenvolvidas especificamente para Jiu-Jitsu Infantil e usam elementos próprios do BJJ (guarda, passagem, kimono, faixa). Algumas atividades de aquecimento e coordenação podem ser adaptadas para outras artes marciais, mas o foco é 100% BJJ.",
  },
  {
    q: "Para qual faixa etária são as dinâmicas?",
    a: "As 50 dinâmicas cobrem dos 4 aos 12 anos. Cada dinâmica indica a idade recomendada, o tempo de duração, os materiais necessários e sugestões de variação para diferentes níveis.",
  },
  {
    q: "Posso usar se for professor iniciante?",
    a: "Sim — inclusive, é para você. As dinâmicas já vêm com objetivo, passo a passo e dica do professor. Você não precisa adaptar nada: lê, aplica na aula, observa o resultado.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia incondicional, conforme o Código de Defesa do Consumidor (Art. 49). Basta responder o email da compra e devolvemos 100% do valor, sem perguntas.",
  },
  {
    q: "Como acesso o grupo do WhatsApp?",
    a: "Ao comprar o plano 'Livro + Grupo WhatsApp', o link de acesso ao grupo é enviado automaticamente junto com o acesso à biblioteca, dentro de minutos após a confirmação do pagamento.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-white/6 bg-[#111] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <Badge>FAQ</Badge>
          <h2 className="mt-4 font-display text-3xl font-black text-white sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>
        <div className="mt-10 space-y-2">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-white">{f.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-white/55">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
