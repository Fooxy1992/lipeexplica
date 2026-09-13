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
    q: "Como recebo o acesso após assinar?",
    a: "Assim que o pagamento é aprovado, você recebe um email com o link da biblioteca. O login é feito com o mesmo email da assinatura — via link mágico, Google ou Apple.",
  },
  {
    q: "Qual a diferença entre Essencial e Completo?",
    a: "No Essencial você acessa as 50 dinâmicas completas da biblioteca atual, com busca, favoritos e progresso. No Completo tudo isso mais dinâmicas novas publicadas todo mês — a biblioteca cresce enquanto sua assinatura estiver ativa.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem multa e sem burocracia. Você cancela diretamente pelo portal de assinaturas (link no email da compra ou em lipeexplica.com/library > Conta). O acesso continua até o fim do período já pago.",
  },
  {
    q: "Se eu cancelar, perco o acesso?",
    a: "Sim, o acesso é ativo enquanto a assinatura estiver vigente. Se você voltar depois, a biblioteca estará lá — com tudo que foi publicado no intervalo.",
  },
  {
    q: "Recebo dinâmicas novas todo mês no plano Essencial?",
    a: "Não. O Essencial dá acesso permanente às 50 dinâmicas atuais, com correções e melhorias. Novos conteúdos mensais são exclusivos do plano Completo.",
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
