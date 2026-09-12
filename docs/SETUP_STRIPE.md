# Setup Stripe

## 1. Chaves

**Developers → API keys** → `Secret key` → `STRIPE_SECRET_KEY`
(use `sk_test_...` até o go-live).

## 2. Produto + Price

1. **Product catalog → Add product**
   - Name: `50 Dinâmicas para Jiu-Jitsu Infantil`
   - Price: one-off, BRL (ex.: R$ 47,00)
2. Copie o **Price ID** (`price_...`).
3. Atualize o produto no banco (via `/admin/products` ou SQL):

```sql
update public.products
set stripe_price_id = 'price_XXXX', price = 4700
where slug = 'dinamicas-jiu-jitsu-infantil';
```

> O valor cobrado é SEMPRE o do Stripe Price. `products.price` é só exibição.

## 3. Webhook

1. **Developers → Webhooks → Add endpoint**
   - URL: `https://lipeexplica.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`
2. Copie o **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

Local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# use o whsec_ impresso no terminal no seu .env.local
```

## 4. Teste ponta a ponta (modo test)

1. `npm run dev` + `stripe listen ...`
2. Landing → Comprar → cartão `4242 4242 4242 4242`, qualquer validade/CVC.
3. Confira:
   - log `purchase.created` no terminal
   - linha nova em `purchases` (status `paid`)
   - usuário criado em **Authentication → Users**
   - n8n disparado (se configurado)
4. Login com o email usado → `/library` → livro liberado.

## 5. Metadata (como o webhook sabe o produto)

`/api/checkout` grava `metadata.product_id` + `metadata.product_slug` na
Checkout Session e no PaymentIntent. O webhook lê `metadata.product_id`.
Se criar sessões manualmente, inclua sempre esse metadata.

## 6. Reembolsos

Estorno do valor: Stripe Dashboard → Payment → Refund.
Revogar acesso: `/admin/purchases` → botão **Reembolsar** (marca
`status=refunded`; o acesso cai na hora).
