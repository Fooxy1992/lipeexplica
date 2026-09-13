"use client";

import Link from "next/link";
import {
  BookOpen,
  Check,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Star,
  Target,
  X,
  ArrowDown,
  Zap,
  Users,
  Calendar,
  Trophy,
  Baby,
  Dumbbell,
  Swords,
  HandMetal,
  Shield,
} from "lucide-react";
import type { Product } from "@/core/domain/entities/product";
import type { ProductPlan } from "@/core/domain/entities/product-plan";
import { formatPrice } from "@/lib/utils";
import { BuyButton } from "./buy-button";
import { DynamicPreview } from "./dynamic-preview";
import { InlineDemo } from "./inline-demo";
import { Faq } from "./faq";

/* ─────────────────────────────────────────── PALETTE CONSTANTS ── */

const RED = "#ff4b2b"; // vermelho oficial da marca
const GOLD = "#facc15";
const CARD = "#121314"; // surface 1

/* ────────────────────────────────────────────────── HELPERS ── */

/**
 * Mid-page CTA. Now that there are two tiers, a button here cannot decide which
 * one the visitor wants, so it scrolls to the pricing block instead of starting
 * a checkout for a plan nobody chose.
 */
function SectionCta({ label }: { label?: string }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-2">
      <a
        href="#comprar"
        // Cor vem da variante `gold` do <Button>. Classes Tailwind NUNCA podem
        // ser montadas por template literal: a extração é estática, então
        // `bg-[${GOLD}]` jamais gerava CSS.
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#facc15] px-10 text-base font-black uppercase tracking-wide text-[#09090b] transition hover:brightness-110"
      >
        <ShoppingBag className="h-4 w-4" />
        {label ?? "VER OS PLANOS"}
      </a>
      <p className="text-xs text-white/30">Acesso imediato · 7 dias de garantia</p>
    </div>
  );
}

function GlowBlob({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: `radial-gradient(circle, rgba(255,75,43,0.18), transparent 70%)` }}
    />
  );
}

function GoldGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: `radial-gradient(circle, rgba(250,204,21,0.10), transparent 70%)` }}
    />
  );
}

/* ────────────────────────────────────────────────────── HERO ── */

export function Hero({ product, plans }: { product: Product; plans: ProductPlan[] }) {
  return (
    <section className="relative overflow-hidden px-6 pb-0 pt-16 sm:pt-24">
      <GlowBlob className="-top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 opacity-20" />
      <GlowBlob className="right-0 top-1/3 h-[400px] w-[400px] translate-x-1/3 opacity-10" />

      <div className="relative mx-auto grid w-full max-w-6xl items-start gap-12 md:grid-cols-2">
        {/* Left — copy */}
        <div className="pt-4">
          {/* Social proof chip */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-[#facc15] text-[#facc15]" />
              ))}
            </div>
            <span className="text-xs text-white/60">
              <strong className="text-white">+127 professores</strong> já utilizam
            </span>
          </div>

          <h1 className="font-display text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
            Nunca mais fique sem ideias para suas{" "}
            <span style={{ color: RED }}>aulas de Jiu-Jitsu Infantil.</span>
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/60">
            50 dinâmicas prontas para aplicar que deixam suas aulas mais divertidas,
            organizadas e envolventes — sem horas de planejamento.
          </p>

          {/* Trust list */}
          <div className="mt-6 flex flex-col gap-2">
            {[
              "Acesso imediato após assinar",
              "Funciona em qualquer dispositivo",
              "Dinâmicas novas todo mês no plano Completo",
              "Cancele quando quiser, sem multa",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-white/70">
                <Check className="h-4 w-4 shrink-0" style={{ color: RED }} />
                {t}
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div id="comprar" className="mt-8 max-w-sm space-y-3">
            {plans.map((p) => (
              <PricingCard key={p.id} productId={product.id} plan={p} />
            ))}
          </div>
          <p className="mt-3 text-xs text-white/25">
            Pagamento seguro via Stripe · 7 dias de garantia incondicional
          </p>
        </div>

        {/* Right — DynamicPreview (THE most important element) */}
        <div className="flex justify-center">
          <DynamicPreview />
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative mx-auto mt-16 max-w-6xl border-t border-white/6 py-6">
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { value: "+127", label: "professores ativos" },
            { value: "+2.400", label: "dinâmicas aplicadas" },
            { value: "4,9★", label: "avaliação média" },
            { value: "7 dias", label: "garantia total" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-black text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-white/35">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────── PROBLEM ── */

export function ProblemSection() {
  const pains = [
    "Sempre repete as mesmas brincadeiras nas aulas",
    "As crianças perdem a atenção e a motivação no meio do treino",
    "Gasta horas planejando aulas e ainda não sabe o que vai fazer",
    "Fica sem ideias e improvisa na hora — e percebe que não funcionou",
    "Alunos saem sem querer voltar na semana seguinte",
  ];

  return (
    <section
      className="relative overflow-hidden border-t border-white/6 px-6 py-20"
      style={{ background: CARD }}
    >
      <GlowBlob className="-bottom-20 left-1/4 h-[500px] w-[500px] opacity-8" />
      <div className="relative mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
            A realidade de muitos professores
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
            Você passa por isso?
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {pains.map((p) => (
            <div
              key={p}
              className="flex items-start gap-4 rounded-2xl border border-white/6 bg-white/3 px-5 py-4"
            >
              <X className="mt-0.5 h-5 w-5 shrink-0" style={{ color: RED }} />
              <p className="text-base text-white/80">{p}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3 text-white/40">
            <div className="h-px w-16 bg-white/15" />
            <ArrowDown className="h-5 w-5" style={{ color: RED }} />
            <div className="h-px w-16 bg-white/15" />
          </div>
          <p className="mt-2 text-lg font-semibold text-white">
            Isso tem solução. E ela cabe no seu celular.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────── TRANSFORMATION ── */

export function TransformationSection() {
  return (
    <section className="border-t border-white/6 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
            A mudança
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
            Antes e depois do livro
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-white/30">Antes</p>
            {[
              "Improvisa na hora — e a aula não tem ritmo",
              "Crianças entediadas e sem foco",
              "Pais perguntando se o filho vai continuar",
              "Repete o rolamento livre pela quinta vez seguida",
              "Chega na academia sem saber o que vai fazer",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 py-2 text-sm text-white/45">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-white/20" />
                {t}
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: `${RED}40`,
              background: `linear-gradient(135deg, ${RED}0a, rgba(250,204,21,0.04))`,
            }}
          >
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: RED }}>
              Depois
            </p>
            {[
              "Chega com tudo planejado em 2 minutos no celular",
              "Crianças animadas e pedindo mais",
              "Pais vendo resultado e renovando a mensalidade",
              "Aulas com começo, meio e fim — estrutura real",
              "Professor confiante e respeitado pelo elenco",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 py-2 text-sm text-white/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────── CATEGORIES ── */

const CATEGORIES = [
  { icon: Dumbbell,   label: "Aquecimento",  count: 8, color: RED },
  { icon: Target,     label: "Coordenação",  count: 6, color: GOLD },
  { icon: Trophy,     label: "Jogos",        count: 7, color: "#4ade80" },
  { icon: Shield,     label: "Guarda",       count: 5, color: "#60a5fa" },
  { icon: Swords,     label: "Passagem",     count: 5, color: "#a78bfa" },
  { icon: HandMetal,  label: "Disciplina",   count: 4, color: "#f472b6" },
  { icon: Users,      label: "Equipe",       count: 6, color: "#34d399" },
  { icon: Star,       label: "Competição",   count: 5, color: GOLD },
  { icon: Heart,      label: "Encerramento", count: 4, color: "#fb7185" },
];

export function CategoriesSection({ product }: { product: Product }) {
  return (
    <section className="border-t border-white/6 px-6 py-20" style={{ background: CARD }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
            O conteúdo
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
            50 dinâmicas em 9 categorias
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/45">
            Cada dinâmica tem objetivo, faixa etária, tempo, materiais e passo a passo.
            Filtre por categoria e encontre o que precisa em segundos.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 lg:grid-cols-9">
          {CATEGORIES.map(({ icon: Icon, label, count, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/6 bg-white/3 px-3 py-5 text-center transition hover:border-white/12 hover:-translate-y-0.5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}18` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <p className="text-[11px] font-semibold text-white/80">{label}</p>
              <p className="text-[10px] text-white/30">{count} din.</p>
            </div>
          ))}
        </div>

        <SectionCta label="VER OS PLANOS" />
      </div>
    </section>
  );
}

/* ────────────────────────────────────────── INLINE DEMO ── */

export function DemoSection({ product }: { product: Product }) {
  return (
    <section className="relative overflow-hidden border-t border-white/6 px-6 py-20">
      <GlowBlob className="-top-20 right-1/4 h-[500px] w-[500px] opacity-10" />
      <GoldGlow className="-bottom-20 left-1/4 h-[400px] w-[400px]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: `${GOLD}40`, color: GOLD, background: `${GOLD}08` }}
          >
            <Zap className="h-3 w-3" /> Preview interativo · Sem cadastro
          </div>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Experimente antes de comprar
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
            Navegue pelas primeiras dinâmicas exatamente como no livro.
            Sinta a plataforma funcionando — depois decida.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <InlineDemo
            productId={product.id}
            onBuy={() => {
              const el = document.getElementById("comprar");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        <p className="mt-10 text-center text-xs text-white/25">
          Estas são as primeiras 2 de 50 dinâmicas completas
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── BENEFITS ── */

const OUTCOMES = [
  { icon: Calendar,    color: RED,      title: "Menos tempo planejando",    body: "50 dinâmicas prontas. Abre o celular, escolhe a categoria, aplica." },
  { icon: Baby,        color: GOLD,     title: "Crianças querendo voltar",  body: "Aulas com variação constante mantêm o engajamento — e os pais renovam a mensalidade." },
  { icon: Heart,       color: "#f472b6",title: "Pais mais satisfeitos",     body: "Quando a criança volta animada, os pais percebem que valeu a mensalidade." },
  { icon: Target,      color: "#4ade80",title: "Mais disciplina no tatame", body: "Dinâmicas com regras claras ensinam foco, respeito e hierarquia sem precisar gritar." },
  { icon: Trophy,      color: GOLD,     title: "Alunos evoluindo mais",     body: "Conteúdo pedagógico progressivo — cada dinâmica reforça uma habilidade real do BJJ." },
  { icon: ShieldCheck, color: "#60a5fa",title: "Professor mais confiante",  body: "Chegar preparado muda sua postura. A turma sente, respeita e performa melhor." },
];

export function Benefits() {
  return (
    <section className="border-t border-white/6 px-6 py-20" style={{ background: CARD }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
            O que muda nas suas aulas
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
            Você não está assinando um app.
            <br />
            <span style={{ color: RED }}>Está assinando resultados.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o) => (
            <div
              key={o.title}
              className="group rounded-2xl border border-white/6 bg-white/3 p-6 transition hover:border-white/10 hover:-translate-y-0.5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${o.color}18` }}>
                <o.icon className="h-5 w-5" style={{ color: o.color }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{o.body}</p>
            </div>
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
  );
}

/* ───────────────────────────────────────── TESTIMONIALS ── */

const TESTIMONIALS = [
  {
    name: "Prof. Rafael M.",
    role: "Faixa preta",
    location: "Escola de JJ Infantil · SP",
    body: "As aulas ficaram muito mais dinâmicas. As crianças pedem as brincadeiras pelo nome e os pais já comentam a diferença.",
  },
  {
    name: "Profa. Camila S.",
    role: "Instrutora kids",
    location: "Equipe Gracie · RJ",
    body: "O formato interativo é genial — abro no celular na beira do tatame e aplico na hora. Economizo pelo menos 3 horas por semana.",
  },
  {
    name: "Prof. Diego A.",
    role: "Faixa marrom",
    location: "Projeto social · MG",
    body: "Organização impecável por categoria. As crianças do projeto ficaram mais focadas e disciplinadas depois que comecei a usar.",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-white/6 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
            Quem já usa no tatame
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
            Professores que transformaram suas aulas
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-10">
            {[
              { value: "+127", label: "professores ativos" },
              { value: "+2.400", label: "dinâmicas aplicadas" },
              { value: "4,9★", label: "avaliação média" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-black" style={{ color: RED }}>{s.value}</p>
                <p className="mt-1 text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/75">&ldquo;{t.body}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.role} · {t.location}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionCta />
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────── ABOUT ── */

export function AboutSection() {
  return (
    <section className="border-t border-white/6 px-6 py-20" style={{ background: CARD }}>
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: RED }}>
              Quem é o Lipe
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
              Feito por professor,{" "}
              <span style={{ color: RED }}>para professor.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Lipe é professor de Jiu-Jitsu há mais de 10 anos, com foco em turmas
              infantis. Criou o LipeExplica para compartilhar o que funcionou —
              e o que não funcionou — em anos de tatame com crianças de 4 a 12 anos.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              As 50 dinâmicas foram testadas em aula real, com crianças de verdade.
              Nada foi tirado de livro de pedagogia. Tudo foi validado no tatame.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["10+ anos ensinando", "Faixa preta BJJ", "+300 alunos formados", "Ex-competidor"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className="flex h-64 w-48 items-end justify-center overflow-hidden rounded-3xl border border-white/8"
              style={{ background: "linear-gradient(160deg, #1f1210 0%, #1a1a1a 100%)" }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl" style={{ background: `${RED}18` }}>
                  <span className="text-4xl">🥋</span>
                </div>
                <p className="mt-3 text-sm font-bold text-white">Lipe</p>
                <p className="text-xs text-white/40">Faixa preta · BJJ Infantil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────── GUARANTEE ── */

export function GuaranteeSection() {
  return (
    <section className="border-t border-white/6 px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-[#4ade80]/25 bg-[#4ade80]/6">
          <ShieldCheck className="h-9 w-9 text-[#4ade80]" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-black text-white sm:text-4xl">
          Garantia de 7 dias
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/60">
          Se você comprar, acessar e não gostar — por qualquer motivo —
          basta responder o email da compra em até 7 dias.
          Devolvemos <strong className="text-white">100% do valor</strong>, sem perguntas.
        </p>
        <p className="mt-3 text-sm text-white/30">
          Conforme o Código de Defesa do Consumidor (Art. 49)
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── FINAL CTA ── */

export function FinalCta({ product, plans }: { product: Product; plans: ProductPlan[] }) {
  return (
    <section
      id="oferta"
      className="relative overflow-hidden border-t border-white/6 px-6 py-20 text-center"
      style={{ background: CARD }}
    >
      <GlowBlob className="-bottom-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 opacity-18" />
      <GoldGlow className="-top-20 right-1/4 h-[300px] w-[300px]" />

      <div className="relative mx-auto max-w-2xl">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ borderColor: `${RED}40`, color: RED, background: `${RED}08` }}
        >
          🔥 Oferta de lançamento
        </div>
        <h2 className="font-display text-3xl font-black text-white sm:text-5xl">
          Sua próxima aula pode ser{" "}
          <span style={{ color: RED }}>inesquecível.</span>
        </h2>
        <p className="mt-4 text-base text-white/50">
          Junte-se a mais de 127 professores que já transformaram suas aulas de Jiu-Jitsu Infantil.
        </p>

        <div className="mx-auto mt-10 max-w-sm space-y-3 text-left">
          {plans.map((p) => (
            <PricingCard key={p.id} productId={product.id} plan={p} />
          ))}
        </div>

        <p className="mt-6 text-xs text-white/25">
          Pagamento seguro via Stripe · Acesso imediato · 7 dias de garantia
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────── PRICING CARD ── */

function PricingCard({ productId, plan }: { productId: string; plan: ProductPlan }) {
  const displayPrice = formatPrice(plan.price, plan.currency.toUpperCase());
  const priceLabel = `${displayPrice}/mês`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 text-left transition"
      style={
        plan.highlight
          ? { borderColor: `${RED}60`, background: `linear-gradient(135deg, ${RED}0d, ${GOLD}08)` }
          : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
      }
    >
      {/* top row: icon + name/badge + price */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={
            plan.highlight
              ? { background: `linear-gradient(135deg,${RED},#f87171)` }
              : { background: `${RED}18` }
          }
        >
          {plan.highlight ? (
            <Star className="h-4 w-4 text-white" />
          ) : (
            <BookOpen className="h-4 w-4" style={{ color: RED }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display font-semibold text-white">{plan.name}</p>
            {plan.highlight && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#09090b]"
                style={{ background: GOLD }}
              >
                Recomendado
              </span>
            )}
          </div>
          {plan.description && (
            <p className="mt-0.5 text-xs text-white/40">{plan.description}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-black text-white">{priceLabel}</p>
          <p className="text-[10px] text-white/30">por mês</p>
        </div>
      </div>

      {plan.features.length > 0 && (
        <ul className="mt-3 space-y-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-xs text-white/50">
              <Check className="h-3.5 w-3.5 shrink-0" style={{ color: RED }} />
              {f}
            </li>
          ))}
        </ul>
      )}

      <BuyButton
        productId={productId}
        planSlug={plan.slug}
        label={`ASSINAR ${plan.name.toUpperCase()} — ${priceLabel}`}
        className="mt-4 w-full"
      />
    </div>
  );
}

export { Faq };
