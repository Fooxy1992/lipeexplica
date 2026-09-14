import type Stripe from 'stripe';
import { DomainError } from '@/core/domain/errors/domain-error';
import { calculateRafflePrice } from './calculate-raffle-price';
import type { RaffleRepository } from '@/core/application/ports/raffle-repository';
import type { RaffleTicketRepository } from '@/core/application/ports/raffle-ticket-repository';
import type { RafflePurchaseRepository } from '@/core/application/ports/raffle-purchase-repository';
import type { Logger } from '@/core/application/ports/logger';

export interface PurchaseRaffleTicketsInput {
  raffleId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  siteUrl: string;
}

export interface PurchaseRaffleTicketsResult {
  sessionUrl: string;
  confirmationToken: string;
}

export class PurchaseRaffleTickets {
  constructor(
    private readonly raffles: RaffleRepository,
    private readonly tickets: RaffleTicketRepository,
    private readonly purchases: RafflePurchaseRepository,
    private readonly stripe: Stripe,
    private readonly logger: Logger,
  ) {}

  async execute(input: PurchaseRaffleTicketsInput): Promise<PurchaseRaffleTicketsResult> {
    const log = this.logger.child({ scope: 'purchase-raffle-tickets', raffleId: input.raffleId });

    const raffle = await this.raffles.findById(input.raffleId);
    if (!raffle) throw new DomainError('NOT_FOUND', 'Rifa não encontrada');
    if (raffle.status !== 'active') throw new DomainError('CONFLICT', 'Rifa não está mais aceitando compras');

    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new DomainError('VALIDATION', 'Quantidade inválida');
    }

    const available = await this.tickets.countAvailable(input.raffleId);
    if (available < input.quantity) {
      throw new DomainError(
        'CONFLICT',
        `Apenas ${available} bilhete${available !== 1 ? 's' : ''} disponível${available !== 1 ? 'is' : ''}`,
      );
    }

    const amountCents = calculateRafflePrice(input.quantity);

    const purchase = await this.purchases.create({
      raffleId: input.raffleId,
      ticketQuantity: input.quantity,
      amountCents,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      buyerPhone: input.buyerPhone,
    });

    const { tickets } = await this.tickets.reserveTickets(input.raffleId, input.quantity, purchase.id);
    const ticketNumbers = tickets.map((t) => t.ticketNumber).sort((a, b) => a - b);

    log.info('raffle.tickets_reserved', { purchaseId: purchase.id, tickets: ticketNumbers });

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: amountCents,
            product_data: {
              name: `Rifa — ${input.quantity} bilhete${input.quantity > 1 ? 's' : ''}`,
              description: `Bilhete${input.quantity > 1 ? 's' : ''}: ${ticketNumbers.join(', ')}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: input.buyerEmail,
      phone_number_collection: { enabled: true },
      success_url: `${input.siteUrl}/rifa/confirmacao/${purchase.confirmationToken}`,
      cancel_url: `${input.siteUrl}/rifa`,
      metadata: {
        type: 'raffle',
        raffle_id: input.raffleId,
        purchase_id: purchase.id,
      },
      payment_intent_data: {
        metadata: { type: 'raffle', purchase_id: purchase.id },
      },
    });

    if (!session.url) throw new DomainError('PAYMENT', 'Stripe não retornou URL de checkout');

    await this.purchases.updateStatus(purchase.id, 'pending', session.id);

    return { sessionUrl: session.url, confirmationToken: purchase.confirmationToken };
  }
}
