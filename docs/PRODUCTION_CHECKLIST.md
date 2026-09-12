# Checklist de Produção

## Supabase
- [ ] Migrations aplicadas (`0001` + `0002`)
- [ ] RLS ativa nas 5 tabelas (testado com anon key)
- [ ] `stripe_price_id` real no produto (sem `price_REPLACE_ME`)
- [ ] Email provider (Magic Link) com SMTP próprio (Resend/Postmark) — o SMTP
      default do Supabase tem limite baixo e cai em spam
- [ ] Google OAuth configurado; Apple opcional
- [ ] Redirect URLs de produção cadastradas
- [ ] Seu usuário com `is_admin = true`
- [ ] Backups automáticos habilitados (plano Pro)

## Stripe
- [ ] Conta em modo live, dados bancários verificados
- [ ] Produto + Price BRL criados (live mode)
- [ ] Webhook de produção com `checkout.session.completed`
- [ ] `STRIPE_WEBHOOK_SECRET` de produção na Vercel
- [ ] Compra real de teste (valor baixo) executada e reembolsada

## n8n
- [ ] Workflow em Production (não test URL)
- [ ] Header `X-Webhook-Token` validado no IF node
- [ ] WhatsApp provider conectado e testado
- [ ] Email testado (inbox, não spam)

## Vercel
- [ ] Todas as env vars de produção (Sensitive onde indicado)
- [ ] Domínio lipeexplica.com + SSL ativo
- [ ] `NEXT_PUBLIC_SITE_URL=https://lipeexplica.com`
- [ ] Build verde no deploy de produção

## Segurança
- [ ] `.env.local` fora do git (conferir `git status`)
- [ ] Service role key nunca em código client (`grep -r SERVICE_ROLE src/`)
- [ ] Teste 403: acessar `/books/dinamicas-jiu-jitsu-infantil` logado SEM compra
- [ ] Teste redirect: acessar `/library` deslogado → `/login`
- [ ] Webhook falso → 400 (`curl -X POST .../api/stripe/webhook`)

## Fluxo ponta a ponta (live)
- [ ] Landing carrega com preço correto
- [ ] Compra → /obrigado
- [ ] Email + WhatsApp chegam com link
- [ ] Magic link loga e mostra a biblioteca
- [ ] Livro abre, progresso salva (recarregue e confira "Continuar Leitura")
- [ ] Admin: venda aparece em /admin/purchases

## Analytics
- [ ] PostHog key configurada (opcional)
- [ ] GA4 Measurement ID (opcional)
- [ ] Eventos `checkout_started` visíveis
