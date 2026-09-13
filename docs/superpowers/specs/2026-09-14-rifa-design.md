# Design: Sistema de Rifa — Kimono Completo

**Data:** 2026-09-14  
**Status:** Aprovado

---

## Contexto

Adicionar sistema de rifa ao site lipeexplica. Prêmio: kimono completo (R$400-600). Objetivo: arrecadar ~R$9.000 via venda de 200 bilhetes em pacotes. Sorteio automático 5 dias após todos os bilhetes serem vendidos.

---

## Precificação por quantidade

Comprador digita quantos bilhetes quer (mínimo 1, máximo = bilhetes disponíveis). Preço calculado automaticamente por faixa:

| Quantidade | Preço/bilhete | Exemplo |
|------------|---------------|---------|
| 1-2 | R$25 | 2 = R$50 |
| 3-4 | R$20 | 4 = R$80 |
| 5-9 | R$18 | 7 = R$126 |
| 10+ | R$15 | 12 = R$180 |

**Total de bilhetes:** 200  
**Pagamento:** Stripe (cartão + PIX)

### Bloqueio ao atingir limite
- Frontend: botão de compra desabilitado quando `available_tickets = 0`
- Backend: `POST /api/raffle/checkout` retorna 409 se bilhetes insuficientes
- Stripe: sessões são criadas sob demanda (não há link fixo para cancelar); a rejeição acontece antes da sessão ser criada

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
ticket_quantity     int NOT NULL  -- quantidade digitada pelo comprador
amount_cents        int NOT NULL  -- calculado pela faixa de preço
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
- Recebe: `{ raffle_id, quantity, buyer_name, buyer_email, buyer_phone }`
- Valida `quantity >= 1` e `quantity <= available_tickets`; retorna 409 se insuficiente
- Calcula `amount_cents` pela faixa de preço (1-2 / 3-4 / 5-9 / 10+)
- Reserva `quantity` bilhetes atomicamente via Supabase transaction (`SELECT FOR UPDATE`)
- Cria Stripe Checkout Session com o valor calculado
- Retorna: `{ session_url }`

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
- Input numérico de quantidade com preview do preço calculado em tempo real
- Sugestões rápidas (ex: botões "1", "3", "5", "10") que preenchem o input
- Botão de compra desabilitado quando `available_tickets = 0`
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
