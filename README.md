# LipeExplica — Plataforma de Produtos Digitais

Plataforma multi-produto (estilo Hotmart/Kiwify/Gumroad, própria) para vender
eBooks interativos, cursos e outros produtos digitais em
[lipeexplica.com](https://lipeexplica.com).

Primeiro produto: **50 Dinâmicas para Jiu-Jitsu Infantil** — um livro que não
é PDF, é uma aplicação web interativa, liberada apenas para compradores.

## Stack

| Camada     | Tecnologia                                   |
| ---------- | -------------------------------------------- |
| Frontend   | Next.js 15 (App Router) · React 19 · TS strict |
| UI         | Tailwind CSS 4 · shadcn-style · Motion · Lucide |
| Auth + DB  | Supabase (Auth SSR + Postgres + RLS)         |
| Pagamentos | Stripe Checkout + Webhooks                   |
| Automação  | n8n (WhatsApp + Email pós-compra)            |
| Analytics  | PostHog + Google Analytics                   |

## Fluxo de compra

```
Landing → Comprar → Stripe Checkout → pagamento aprovado
  → Webhook /api/stripe/webhook (assinatura verificada, idempotente)
    → cria usuário (se não existe) → registra compra → libera acesso
    → POST n8n → WhatsApp + Email com link da biblioteca
  → cliente faz login (magic link / Google) → /library → abre o livro
```

## Arquitetura (Clean Architecture)

```
src/
├── core/                     # ZERO dependências de framework
│   ├── domain/
│   │   ├── entities/         # Product, Purchase, Profile, ReadingProgress
│   │   └── errors/           # DomainError tipado → HTTP status
│   └── application/
│       ├── ports/            # Interfaces (repos, gateways, logger)
│       └── use-cases/        # CreateCheckoutSession, HandleCheckoutCompleted,
│                             # GetUserLibrary, GetBookAccess, SaveReadingProgress
├── infrastructure/           # Implementações concretas
│   ├── supabase/             # clients (browser/server/admin) + auth gateway
│   ├── repositories/         # Supabase*Repository + mappers
│   ├── stripe/               # SDK client + StripePaymentGateway
│   ├── n8n/                  # N8nNotificationGateway
│   ├── logging/              # ConsoleLogger (JSON estruturado)
│   ├── security/             # rate limiter (Upstash-ready)
│   └── di/container.ts       # composition root (user-scoped × admin)
├── app/                      # Rotas (App Router)
│   ├── page.tsx              # Landing
│   ├── login/ · auth/        # Magic link, Google, Apple (preparado)
│   ├── library/              # Área do cliente
│   ├── books/[slug]/         # Leitor protegido (403 sem compra)
│   ├── admin/                # Painel admin (produtos, compras, usuários)
│   └── api/                  # checkout · stripe/webhook · progress
├── components/               # ui/ · marketing/ · library/ · book/ · auth/
├── hooks/                    # use-reading-progress (sync servidor)
├── data/ · types/            # Conteúdo do livro
└── lib/                      # env (zod), utils
supabase/migrations/          # Schema + RLS + seed
docs/                         # Setup e operação (veja abaixo)
```

Regra de dependência: `app → infrastructure → core`. O `core` não importa
nada de Next/Supabase/Stripe — trocar de provedor = nova implementação do port.

## Banco de dados

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para o diagrama completo.
Tabelas: `products`, `purchases`, `profiles`, `reading_progress`,
`webhook_events` — todas com RLS, FKs e índices.

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha (docs/SETUP_*.md)
npm run dev
```

Stripe webhook local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — fluxograma + diagrama das tabelas
- [docs/SETUP_SUPABASE.md](docs/SETUP_SUPABASE.md) — projeto, migrations, auth providers
- [docs/SETUP_STRIPE.md](docs/SETUP_STRIPE.md) — produto, price, webhook
- [docs/SETUP_N8N.md](docs/SETUP_N8N.md) — workflow WhatsApp + Email
- [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) — publicação
- [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) — checklist de go-live

## Segurança (resumo)

- Preço nunca vem do frontend — sempre do Stripe Price (`/api/checkout` recebe só `productId`)
- Webhook valida assinatura (`STRIPE_WEBHOOK_SECRET`) + idempotência dupla (event id + session id)
- RLS em todas as tabelas; service role só no webhook/admin
- Middleware protege `/library`, `/books/*`, `/dashboard`, `/admin` + revalidação página a página (defesa em profundidade)
- Rate limit no checkout, headers de segurança (CSP, HSTS, X-Frame-Options), env validada com Zod
- Login sem enumeração de emails; magic link não cria conta (conta nasce na compra)

## Adicionando um novo produto

1. `INSERT` em `products` (nova migration) com novo `slug`
2. Criar Product/Price no Stripe e preencher `stripe_price_id` (via `/admin/products`)
3. eBook interativo? Registrar o componente no
   [`book-registry.tsx`](src/components/book/book-registry.tsx)
4. Pronto — checkout, webhook, biblioteca e proteção já funcionam.
