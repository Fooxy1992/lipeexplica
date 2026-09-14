import { DomainError } from '@/core/domain/errors/domain-error';
import type { RaffleRepository } from '@/core/application/ports/raffle-repository';
import type { RaffleTicketRepository } from '@/core/application/ports/raffle-ticket-repository';
import type { RafflePurchaseRepository } from '@/core/application/ports/raffle-purchase-repository';
import type { Logger } from '@/core/application/ports/logger';

export interface DrawResult {
  winnerTicketNumber: number;
  winnerName: string;
  winnerEmail: string;
}

export class DrawRaffleWinner {
  constructor(
    private readonly raffles: RaffleRepository,
    private readonly tickets: RaffleTicketRepository,
    private readonly purchases: RafflePurchaseRepository,
    private readonly logger: Logger,
  ) {}

  async execute(raffleId: string): Promise<DrawResult> {
    const log = this.logger.child({ scope: 'draw-raffle-winner', raffleId });

    const raffle = await this.raffles.findById(raffleId);
    if (!raffle) throw new DomainError('NOT_FOUND', 'Rifa não encontrada');
    if (raffle.status === 'completed') throw new DomainError('CONFLICT', 'Rifa já foi sorteada');
    if (raffle.status !== 'sold_out') throw new DomainError('CONFLICT', 'Rifa ainda não está encerrada');

    const winner = await this.tickets.findRandomPaid(raffleId);
    if (!winner) throw new DomainError('INTERNAL', 'Nenhum bilhete pago encontrado para sorteio');

    await this.raffles.setWinner(raffleId, winner.id);

    log.info('raffle.winner_drawn', { raffleId, ticketNumber: winner.ticketNumber });

    const winnerPurchase = winner.purchaseId
      ? (await this.purchases.listByRaffle(raffleId)).find((p) => p.id === winner.purchaseId)
      : null;

    return {
      winnerTicketNumber: winner.ticketNumber,
      winnerName: winnerPurchase?.buyerName ?? 'Ganhador',
      winnerEmail: winnerPurchase?.buyerEmail ?? '',
    };
  }
}
