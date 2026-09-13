import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  Check,
  Star,
  ShieldCheck,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { userScopedContainer } from "@/infrastructure/di/container";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { BuyButton } from "@/components/marketing/buy-button";
import type { ProductPlan } from "@/core/domain/entities/product-plan";

export const dynamic = "force-dynamic";

const PAGE_URL = "https://www.lipeexplica.com/mental-do-tatame";
const OG_IMAGE = "https://www.lipeexplica.com/mental-cover.webp";
const SLUG = "mental-do-tatame";
const RED = "#FF4D2D";

export const metadata: Metadata = {
  title: "O Mental do Tatame — 50 Situações de Mentalidade no Jiu-Jitsu",
  description:
    "50 situações reais que todo praticante de jiu-jitsu vive. Ansiedade, ego, frustração, constância, competição e evolução — com a realidade por trás de cada pensamento e o que fazer no tatame.",
  keywords: [
    "mentalidade jiu-jitsu",
    "mental jiu-jitsu",
    "psicologia jiu-jitsu",
    "ansiedade jiu-jitsu",
    "ego jiu-jitsu",
    "desenvolvimento mental artes marciais",
    "mentalidade guerreiro",
    "mental do tatame",
    "lipeexplica",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "O Mental do Tatame",
    description: "50 situações reais que todo praticante de jiu-jitsu vive.",
    url: PAGE_URL,
    siteName: "LipeExplica",
    locale: "pt_BR",
    type: "website",
    images: [{ url: OG_IMAGE, width: 688, height: 1024, alt: "O Mental do Tatame — LipeExplica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "O Mental do Tatame",
    description: "50 situações de mentalidade no jiu-jitsu. Lipeexplica.",
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "O Mental do Tatame",
      description:
        "50 situações reais de mentalidade no jiu-jitsu. Ansiedade, ego, frustração, constância, competição e evolução — com a realidade por trás de cada pensamento e o que fazer.",
      url: PAGE_URL,
      image: OG_IMAGE,
      brand: { "@type": "Brand", name: "LipeExplica" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "14.90",
        highPrice: "24.90",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "LipeExplica" },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Para quem é O Mental do Tatame?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Para qualquer praticante de jiu-jitsu — iniciantes, intermediários, competidores, professores. As situações são reais e independem do nível.",
          },
        },
        {
          "@type": "Question",
          name: "Como acesso após assinar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Imediatamente, em qualquer dispositivo com internet — celular, tablet ou computador. Acesse em lipeexplica.com.",
          },
        },
        {
          "@type": "Question",
          name: "Há garantia de reembolso?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim, 7 dias de garantia incondicional. Basta solicitar por e-mail que devolvemos 100% do valor.",
          },
        },
      ],
    },
  ],
};

const CATEGORIAS = [
  { nome: "Ansiedade", cor: "#818cf8", desc: "O que fazer quando o corpo trava antes de entrar no tatame." },
  { nome: "Ego", cor: "#f59e0b", desc: "Tap, correção, derrota para faixa inferior — como o ego te sabota." },
  { nome: "Frustração", cor: "#f87171", desc: "Plateau, lesão, técnica que não sai no sparring." },
  { nome: "Constância", cor: "#34d399", desc: "A semana sem vontade, treinar cansado, prioridade vs. desculpa." },
  { nome: "Competição", cor: "#60a5fa", desc: "Ansiedade pré-luta, derrota na primeira, o que fazer após perder." },
  { nome: "Evolução", cor: "#a78bfa", desc: "Reconhecer progresso, ensinar, o que o jiu-jitsu muda além do tatame." },
];

const SITUACOES_PREVIEW = [
  {
    id: 1,
    categoria: "Ansiedade",
    titulo: "A noite antes do treino",
    frase: "Coloca o kimono. O resto o tatame resolve.",
  },
  {
    id: 9,
    categoria: "Ego",
    titulo: "Bater para alguém de faixa inferior",
    frase: "Tap é informação. Quem não aprende com ela fica repetindo o erro.",
  },
  {
    id: 17,
    categoria: "Frustração",
    titulo: "O plateau",
    frase: "Plateau não é teto. É patamar. O próximo degrau está logo ali.",
  },
];

const CATEGORIA_COLOR: Record<string, string> = {
  Ansiedade: "#818cf8",
  Ego: "#f59e0b",
  "Frustração": "#f87171",
  Constância: "#34d399",
  Competição: "#60a5fa",
  Evolução: "#a78bfa",
};

export default async function MentalDoTatamePage() {
  const c = await userScopedContainer();

  const [product, userResult] = await Promise.all([
    c.products.findBySlug(SLUG),
    c.db.auth.getUser(),
  ]);

  const isLoggedIn = Boolean(userResult.data.user);

  if (!product) {
    return (
      <div className="site-dark min-h-dvh">
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="grid min-h-[50dvh] place-items-center px-6 text-center">
          <div>
            <h1 className="text-3xl font-black text-[#fafafa]">Em breve</h1>
            <p className="mt-3 text-sm text-[#71717a]">
              O produto está em preparação. Volte em instantes.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const plans = await c.productPlans.listByProduct(product.id);

  return (
    <div className="site-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar isLoggedIn={isLoggedIn} />

      <main>
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pb-0 pt-16 sm:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
            style={{ background: RED }}
          />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
            {/* Copy */}
            <div className="pt-4">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#facc15] text-[#facc15]" />
                  ))}
                </div>
                <span className="text-xs text-white/60">
                  <strong className="text-white">Para todos os níveis</strong>
                </span>
              </div>

              <h1 className="font-display text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
                O que passa pela sua cabeça{" "}
                <span style={{ color: RED }}>no tatame</span>{" "}
                é o que mais te limita.
              </h1>

              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/60">
                50 situações reais de mentalidade no jiu-jitsu — com a realidade
                por trás de cada pensamento, o que fazer, e uma frase para levar
                ao próximo treino.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                {[
                  "Funciona para qualquer faixa e qualquer idade",
                  "Acesso imediato após assinar",
                  "6 categorias: ansiedade, ego, frustração, constância, competição, evolução",
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
                  <PlanCard key={p.id} productId={product.id} plan={p} />
                ))}
              </div>
              <p className="mt-3 text-xs text-white/25">
                Pagamento seguro via Stripe · 7 dias de garantia incondicional
              </p>
            </div>

            {/* Book cover */}
            <div className="flex justify-center" style={{ perspective: "1800px" }}>
              <div
                className="relative aspect-[3/4] w-[260px] sm:w-[320px]"
                style={{
                  transform: "rotateY(-15deg) rotateX(5deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-y-0 -left-1 w-3 rounded-l-md"
                  style={{ background: "linear-gradient(90deg,#000,transparent)", transform: "translateZ(-6px)" }}
                />
                <div className="absolute inset-0 overflow-hidden rounded-r-2xl rounded-l-md border border-[#FF4D2D]/25 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                  <Image
                    src="/mental-cover.webp"
                    alt="Capa do livro O Mental do Tatame"
                    fill
                    priority
                    sizes="320px"
                    className="object-cover"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(8,9,10,0.45) 0%, transparent 40%, rgba(8,9,10,0.85) 100%)" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-7 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffb4a5]">lipeexplica</p>
                    <div className="mt-auto">
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/80">O Mental do</p>
                      <p className="mt-1 text-3xl font-black text-white sm:text-4xl">Tatame</p>
                      <p className="mt-2 text-[11px] text-white/60">50 situações de mentalidade</p>
                      <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/35">OSS 🥋</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative mx-auto mt-16 max-w-6xl border-t border-white/6 py-6">
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              {[
                { value: "50", label: "situações reais" },
                { value: "6", label: "categorias" },
                { value: "100%", label: "baseado no tatame" },
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

        {/* ── PROBLEM ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
            O problema
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black text-white sm:text-4xl">
            O jiu-jitsu não é só físico. E a maioria das academias nunca fala sobre isso.
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/55">
            Você treina, evolui tecnicamente — mas a cabeça ainda te para nos momentos que importam.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Trava na hora de rolar com alguém melhor",
              "Desmotiva quando não vê evolução rápida",
              "Treina com força quando a técnica não funciona",
              "Fica ansioso antes do treino sem razão aparente",
              "Compara sua evolução com a dos outros",
              "Usa qualquer desculpa para não ir treinar",
            ].map((pain) => (
              <div
                key={pain}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4"
              >
                <p className="text-sm leading-relaxed text-white/70">
                  <span className="mr-1.5" style={{ color: RED }}>✗</span>
                  {pain}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ─────────────────────────────────────────── */}
        <section className="bg-white/[0.02] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
              6 categorias
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Cada situação tem um lugar.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIAS.map((cat) => (
                <div
                  key={cat.nome}
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: `color-mix(in oklab, ${cat.cor} 25%, transparent)`,
                    background: `color-mix(in oklab, ${cat.cor} 5%, transparent)`,
                  }}
                >
                  <div
                    className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: `color-mix(in oklab, ${cat.cor} 15%, transparent)`, color: cat.cor }}
                  >
                    <Brain className="h-3 w-3" />
                    {cat.nome}
                  </div>
                  <p className="text-sm leading-relaxed text-white/65">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PREVIEW ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
            Prévia
          </p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Uma amostra do que você vai encontrar.
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SITUACOES_PREVIEW.map((s) => {
              const cor = CATEGORIA_COLOR[s.categoria] ?? RED;
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-2xl border p-5"
                  style={{
                    borderColor: `color-mix(in oklab, ${cor} 20%, transparent)`,
                    background: `color-mix(in oklab, ${cor} 5%, transparent)`,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.28em]"
                    style={{ color: cor }}
                  >
                    #{String(s.id).padStart(2, "0")} · {s.categoria}
                  </p>
                  <p className="font-black text-white">{s.titulo}</p>
                  <div
                    className="mt-auto rounded-xl px-4 py-3 text-sm font-semibold italic text-white"
                    style={{ background: `color-mix(in oklab, ${cor} 12%, transparent)` }}
                  >
                    &ldquo;{s.frase}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="#comprar" className="btn-primary">
              Ver todas as 50 situações
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── BENEFITS ───────────────────────────────────────────── */}
        <section className="bg-white/[0.02] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
              Benefícios
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              O que muda depois que você entende o que passa pela sua cabeça.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { titulo: "Vai treinar mesmo sem vontade", desc: "Porque entendeu que vontade é humor, não compromisso." },
                { titulo: "Para de se comparar", desc: "A única competição que faz sentido é com quem você era ontem." },
                { titulo: "Usa a adrenalina a favor", desc: "Adrenalina não é medo. É combustível — quando você aprende a reconhecer." },
                { titulo: "Tap vira informação", desc: "Não vergonha. Cada tap te diz exatamente o que precisar treinar." },
                { titulo: "Mantém o foco sob pressão", desc: "Porque sabe respirar, redefinir metas, e não entrar em pânico." },
                { titulo: "Evolui mais rápido", desc: "Porque treina com intenção, não só com presença." },
              ].map((b) => (
                <div key={b.titulo} className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: RED }} />
                  <div>
                    <p className="font-bold text-white">{b.titulo}</p>
                    <p className="mt-1 text-sm text-white/55">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
                Sobre o autor
              </p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Felipe Henrique — LipeExplica
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Criador de conteúdo de jiu-jitsu com mais de 5.100 seguidores e
                900 mil visualizações. Produz conteúdo semanal sobre técnica,
                mentalidade e história do jiu-jitsu — sem enrolação.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                O Mental do Tatame nasceu de conversas reais: situações que praticantes
                de todos os níveis vivem e ninguém fala abertamente. Cada situação
                foi escrita baseada em experiência de tatame, não em teoria.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative h-64 w-64 overflow-hidden rounded-3xl border border-white/10">
                <Image
                  src="/mascote.webp"
                  alt="Mascote LipeExplica"
                  fill
                  sizes="256px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── GUARANTEE ──────────────────────────────────────────── */}
        <section className="bg-white/[0.02] py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <ShieldCheck className="mx-auto h-12 w-12" style={{ color: RED }} />
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              7 dias de garantia incondicional
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Se por qualquer motivo você não ficar satisfeito nos primeiros 7 dias,
              devolvemos 100% do valor. Sem perguntas, sem burocracia.
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-2xl font-black text-white">Perguntas frequentes</h2>
          <dl className="mt-8 space-y-5">
            {[
              { q: "Para quem é O Mental do Tatame?", r: "Para qualquer praticante de jiu-jitsu — iniciantes, intermediários, competidores, professores. As situações são reais e independem do nível." },
              { q: "Como acesso após assinar?", r: "Imediatamente, em qualquer dispositivo com internet — celular, tablet ou computador. Basta fazer login em lipeexplica.com." },
              { q: "Precisa ter experiência em jiu-jitsu?", r: "Não. As situações são reconhecíveis desde o primeiro treino. Muitas são universais para quem está começando." },
              { q: "Há garantia de reembolso?", r: "Sim, 7 dias de garantia incondicional. Basta solicitar por e-mail e devolvemos 100% do valor." },
            ].map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                <dt className="font-bold text-white">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/60">{faq.r}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${RED}, transparent)` }}
          />
          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
              Comece agora
            </p>
            <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">
              O tatame já tem a técnica. Agora a cabeça precisa acompanhar.
            </h2>
            <p className="mt-4 text-base text-white/55">
              Acesso imediato. Funciona em qualquer dispositivo.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              {plans.map((p) => (
                <PlanCard key={p.id} productId={product.id} plan={p} />
              ))}
            </div>
            <p className="mt-4 text-xs text-white/25">
              Pagamento seguro via Stripe · 7 dias de garantia · Cancele quando quiser
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <StickyCta />
    </div>
  );
}

function PlanCard({ productId, plan }: { productId: string; plan: ProductPlan }) {
  const monthly = plan.interval === "month";
  return (
    <div
      className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border p-5"
      style={{
        borderColor: monthly ? `${RED}50` : "rgba(255,255,255,0.08)",
        background: monthly ? `color-mix(in oklab, ${RED} 8%, transparent)` : "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-white">{plan.name}</p>
          {plan.description && (
            <p className="mt-0.5 text-xs text-white/50">{plan.description}</p>
          )}
        </div>
        {plan.highlight && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ background: RED }}
          >
            Popular
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white">
        R$ {(plan.price / 100).toFixed(2).replace(".", ",")}
        <span className="text-sm font-normal text-white/40">
          {plan.interval === "month" ? "/mês" : "/ano"}
        </span>
      </p>
      <BuyButton productId={productId} planSlug={plan.slug} className="btn-primary w-full justify-center" />
    </div>
  );
}
