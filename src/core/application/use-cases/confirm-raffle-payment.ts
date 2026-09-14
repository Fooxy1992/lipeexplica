import type { RaffleRepository } from '@/core/application/ports/raffle-repository';
import type { RaffleTicketRepository } from '@/core/application/ports/raffle-ticket-repository';
import type { RafflePurchaseRepository } from '@/core/application/ports/raffle-purchase-repository';
import type { Logger } from '@/core/application/ports/logger';

export interface ConfirmRafflePaymentInput {
  stripeSessionId: string;
}

export class ConfirmRafflePayment {
  constructor(
    private readonly raffles: RaffleRepository,
    private readonly tickets: RaffleTicketRepository,
    private readonly purchases: RafflePurchaseRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: ConfirmRafflePaymentInput): Promise<void> {
    const log = this.logger.child({ scope: 'confirm-raffle-payment' });

    const purchase = await this.purchases.findBySessionId(input.stripeSessionId);
    if (!purchase) {
      log.warn('raffle.purchase_not_found', { sessionId: input.stripeSessionId });
      return;
    }
    if (purchase.status === 'paid') {
      log.info('raffle.purchase_already_paid', { purchaseId: purchase.id });
      return;
    }

    await this.tickets.markAsPaid(purchase.id);
    await this.purchases.updateStatus(purchase.id, 'paid');

    log.info('raffle.payment_confirmed', { purchaseId: purchase.id, quantity: purchase.ticketQuantity });

    const available = await this.tickets.countAvailable(purchase.raffleId);
    if (available === 0) {
      const drawDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      await this.raffles.updateStatus(purchase.raffleId, 'sold_out', drawDate);
      log.info('raffle.sold_out', { raffleId: purchase.raffleId, drawDate });
    }
  }
}
