# Design: Sistema de Rifa — Kimono Completo

**Data:** 2026-09-14  
**Status:** Aprovado

---

## Contexto

Adicionar sistema de rifa ao site lipeexplica. Prêmio: kimono completo (R$400-600). Objetivo: arrecadar ~R$9.000 via venda de 200 bilhetes em pacotes. Sorteio automático 5 dias após todos os bilhetes serem vendidos.

---

## Pacotes de bilhetes

| Pacote | Preço | Por bilhete |
|--------|-------|-------------|
| 1 bilhete | R$25 | R$25 |
| 3 bilhetes | R$60 | R$20 |
| 5 bilhetes | R$90 | R$18 |
| 10 bilhetes | R$150 | R$15 |

**Total de bilhetes:** 200  
**Pagamento:** Stripe (cartão + PIX)

---

## Modelo de Dados (Supabase)

### `raffles`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
title           text NOT NULL
prize_name      text NOT NULL
prize_image_url text
total_tickets   int NOT NULL DEFAULT 200
status          text NOT NULL DEFAULT 'active'
  -- 'active' | 'sold_out' | 'drawing' | 'completed'
draw_date       timestamptz  -- preenchido quando sold_out (now + 5 dias)
winner_ticket_id uuid REFERENCES raffle_tickets(id)
created_at      timestamptz DEFAULT now()
```

### `raffle_tickets`
200 linhas pré-geradas no momento de criação da rifa (números 1-200).
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
raffle_id        uuid REFERENCES raffles(id) NOT NULL
ticket_number    int NOT NULL
status           text NOT NULL DEFAULT 'available'
  -- 'available' | 'reserved' | 'paid'
reserved_until   timestamptz  -- expira em 30min se não pago
purchase_id      uuid REFERENCES raffle_purchases(id)
buyer_name       text
buyer_email      text
buyer_phone      text
created_at       timestamptz DEFAULT now()
UNIQUE(raffle_id, ticket_number)
```

### `raffle_purchases`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
raffle_id           uuid REFERENCES raffles(id) NOT NULL
stripe_session_id   text UNIQUE
package_size        int NOT NULL  -- 1 | 3 | 5 | 10
amount_cents        int NOT NULL
status              text NOT NULL DEFAULT 'pending'
  -- 'pending' | 'paid' | 'failed' | 'expired'
buyer_name          text NOT NULL
buyer_email         text NOT NULL
buyer_phone         text
confirmation_token  text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
created_at          timestamptz DEFAULT now()
```

---

## Arquitetura

Segue o padrão existente: domain entities → use cases → ports → infrastructure.

### Domain Entities
- `src/core/domain/entities/raffle.ts`
- `src/core/domain/entities/raffle-ticket.ts`
- `src/core/domain/entities/raffle-purchase.ts`

### Ports
- `src/core/application/ports/raffle-repository.ts`
- `src/core/application/ports/raffle-ticket-repository.ts`
- `src/core/application/ports/raffle-purchase-repository.ts`

### Use Cases
- `src/core/application/use-cases/purchase-raffle-tickets.ts` — reserva atômica + cria Stripe Session
- `src/core/application/use-cases/confirm-raffle-payment.ts` — chamado pelo webhook, marca bilhetes como paid, checa se sold_out
- `src/core/application/use-cases/draw-raffle-winner.ts` — sorteia aleatoriamente, envia e-mail ao ganhador
- `src/core/application/use-cases/release-expired-reservations.ts` — libera bilhetes com reserved_until expirado

### Infrastructure
- `src/infrastructure/repositories/supabase-raffle-repository.ts`
- `src/infrastructure/repositories/supabase-raffle-ticket-repository.ts`
- `src/infrastructure/repositories/supabase-raffle-purchase-repository.ts`

---

## API Routes

### `POST /api/raffle/checkout`
- Recebe: `{ raffle_id, package_size, buyer_name, buyer_email, buyer_phone }`
- Reserva `package_size` bilhetes atomicamente via Supabase transaction (`SELECT FOR UPDATE`)
- Cria Stripe Checkout Session com line item do pacote
- Retorna: `{ session_url }`
- Race condition tratada: se não houver bilhetes suficientes disponíveis, retorna 409

### `POST /api/raffle/webhook` (ou reutiliza `/api/stripe/webhook`)
- Evento `checkout.session.completed` → chama `confirm-raffle-payment`
- Evento `checkout.session.expired` → libera bilhetes reservados

### `GET /api/raffle/[id]/status`
- Retorna contagem de bilhetes disponíveis/vendidos em tempo real
- Usado pela página pública para atualizar contador

### `GET /api/raffle/confirmacao/[token]`
- Retorna compra + números dos bilhetes para página de confirmação

---

## Sorteio Automático

**Trigger:** Vercel Cron Job rodando diariamente às 10:00 BRT  
**Route:** `GET /api/cron/raffle-draw` (protegida por `CRON_SECRET`)

Lógica:
1. Busca rifas com `status = 'sold_out'` e `draw_date <= now()`
2. Para cada uma: sorteia ticket aleatório dentre os `paid`
3. Atualiza `raffles.winner_ticket_id` e `status = 'completed'`
4. Envia e-mail ao ganhador via notification gateway existente

**Liberação de reservas expiradas:**  
Mesma cron (ou cron separada a cada hora) chama `release-expired-reservations` para bilhetes com `reserved_until < now()` e status `reserved`.

---

## Páginas

### `/rifa` — Pública
- Imagem do kimono
- Contador de bilhetes restantes (atualiza a cada 30s via polling)
- Progresso visual (barra ou grid de 200 bilhetes)
- Cards de pacotes com botão de compra
- Informações do sorteio (data prevista se sold_out, regras)

### `/rifa/confirmacao/[token]` — Pós-compra
- Número(s) do(s) bilhete(s) comprados
- Nome do comprador
- Instrução: "guarde este link"

### `/admin/rifa` — Admin
- Status atual (bilhetes vendidos/total, arrecadação)
- Lista de compradores com seus bilhetes
- Botão "Sortear agora" (override manual, só disponível após sold_out)
- Botão "Criar nova rifa" (para rifas futuras)

---

## Segurança

- Reserva atômica com `SELECT FOR UPDATE` evita overselling
- Webhook validado via Stripe signature (padrão já existente)
- Cron protegida por header `Authorization: Bearer CRON_SECRET`
- `confirmation_token` aleatório de 16 bytes — não expõe IDs internos

---

## Fora do escopo (YAGNI)

- Múltiplas rifas simultâneas (admin gerencia uma de cada vez)
- Reembolso automático
- Integração Loteria Federal
- Compartilhamento social automatizado
