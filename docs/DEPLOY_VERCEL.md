# Deploy na Vercel

## 1. Importar projeto

1. Suba o repositório para o GitHub.
2. [vercel.com/new](https://vercel.com/new) → importe o repo.
3. Framework preset: **Next.js** (detectado automaticamente).

## 2. Environment Variables (Production)

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://lipeexplica.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | do Supabase (Sensitive) |
| `STRIPE_SECRET_KEY` | `sk_live_...` (Sensitive) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` do endpoint de produção (Sensitive) |
| `N8N_PAYMENT_WEBHOOK_URL` | URL de produção do n8n |
| `N8N_WEBHOOK_TOKEN` | token compartilhado (Sensitive) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | opcional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | opcional |

## 3. Domínio

1. Project → Settings → Domains → `lipeexplica.com` (+ `www` com redirect).
2. Aponte o DNS conforme instruções (A/CNAME).

## 4. Pós-deploy

1. Stripe: crie o webhook endpoint apontando para
   `https://lipeexplica.com/api/stripe/webhook` e atualize `STRIPE_WEBHOOK_SECRET`.
2. Supabase: adicione `https://lipeexplica.com/auth/callback` nas Redirect URLs.
3. Redeploy para aplicar env novas.

## 5. Observabilidade

- Logs estruturados (JSON) aparecem em **Vercel → Logs** — filtre por
  `event` (`purchase.created`, `webhook.invalid_signature`, etc).
- Alertas de erro: Vercel → Integrations (ex.: Sentry) se desejar.
