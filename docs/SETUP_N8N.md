# Setup n8n

n8n é **entrega apenas** (WhatsApp + Email). Regras de negócio ficam no Next.js.

## 1. Workflow

Nós, nesta ordem:

```
Webhook (POST /webhook/payment)
  → IF (header X-Webhook-Token == seu token)      ← rejeita chamadas falsas
     → WhatsApp (Evolution API / Z-API / Twilio)
     → Email (SMTP / Resend / SendGrid)
```

1. **Webhook node**: método `POST`, path `payment`. Copie a URL de produção →
   `N8N_PAYMENT_WEBHOOK_URL`.
2. **IF node**: `{{ $json.headers['x-webhook-token'] }}` igual ao valor de
   `N8N_WEBHOOK_TOKEN` (gere um token longo e aleatório).

## 2. Payload recebido

```json
{
  "nome": "Fulano da Silva",
  "email": "fulano@email.com",
  "telefone": "+5511999999999",
  "produto": "50 Dinâmicas para Jiu-Jitsu Infantil",
  "valor": 4700,
  "moeda": "brl",
  "paymentIntent": "pi_...",
  "sessionId": "cs_...",
  "userId": "uuid",
  "libraryUrl": "https://lipeexplica.com/library"
}
```

## 3. Mensagem WhatsApp

```
Olá {{ $json.body.nome }}!

Seu pagamento foi aprovado. ✅

Sua biblioteca já está disponível.

Acesse:
{{ $json.body.libraryUrl }}

Faça login utilizando o email:
{{ $json.body.email }}

Bom estudo!

OSS 🥋
```

## 4. Email (HTML responsivo)

Assunto: `Seu acesso chegou — {{ $json.body.produto }} 🥋`

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background:#0d1220;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="max-width:520px;background:#141a2e;border-radius:16px;padding:40px 32px">
      <tr><td align="center" style="color:#e8b64c;font-size:12px;letter-spacing:4px">
        LIPEEXPLICA.COM
      </td></tr>
      <tr><td align="center" style="padding-top:16px;color:#ffffff;font-size:26px;font-weight:bold">
        Pagamento aprovado! 🥋
      </td></tr>
      <tr><td align="center" style="padding-top:12px;color:#b8bfd4;font-size:15px;line-height:1.6">
        Olá {{ $json.body.nome }},<br>
        seu acesso a <strong style="color:#fff">{{ $json.body.produto }}</strong>
        já está liberado na sua biblioteca.
      </td></tr>
      <tr><td align="center" style="padding-top:28px">
        <a href="{{ $json.body.libraryUrl }}"
           style="background:linear-gradient(135deg,#f2c14e,#e0a63a);color:#141a2e;
                  text-decoration:none;font-weight:bold;font-size:15px;
                  padding:14px 36px;border-radius:999px;display:inline-block">
          Acessar Biblioteca
        </a>
      </td></tr>
      <tr><td align="center" style="padding-top:24px;color:#8891ab;font-size:13px;line-height:1.6">
        Entre com o email <strong style="color:#c8cfe2">{{ $json.body.email }}</strong>
        — sem senha, enviamos um link mágico.
      </td></tr>
      <tr><td align="center" style="padding-top:32px;color:#5a6378;font-size:11px">
        OSS 🥋 — LipeExplica
      </td></tr>
    </table>
  </td></tr>
</table>
```

## 5. Confiabilidade

- Ative o workflow (toggle Production) — a URL de teste muda de path.
- Se o n8n cair, a compra NÃO é perdida: acesso já foi liberado pelo webhook;
  só a notificação falha (logada como `purchase.notification_failed`).
- Opcional: nó extra salvando cada payload num Google Sheet/Notion como ledger.
