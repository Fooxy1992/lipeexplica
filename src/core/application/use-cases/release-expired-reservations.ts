import type { RaffleTicketRepository } from '@/core/application/ports/raffle-ticket-repository';
import type { Logger } from '@/core/application/ports/logger';

export class ReleaseExpiredReservations {
  constructor(
    private readonly tickets: RaffleTicketRepository,
    private readonly logger: Logger,
  ) {}

  async execute(): Promise<void> {
    const released = await this.tickets.releaseExpired();
    if (released > 0) {
      this.logger.info('raffle.reservations_released', { count: released });
    }
  }
}
