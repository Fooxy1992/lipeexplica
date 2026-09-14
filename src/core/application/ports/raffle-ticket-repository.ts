import type { RaffleTicket } from '@/core/domain/entities/raffle-ticket';

export interface ReservedTickets {
  tickets: RaffleTicket[];
}

export interface RaffleTicketRepository {
  /** Chama a RPC reserve_raffle_tickets via service-role. Lança erro se insuficiente. */
  reserveTickets(raffleId: string, quantity: number, purchaseId: string): Promise<ReservedTickets>;
  markAsPaid(purchaseId: string): Promise<void>;
  countByStatus(raffleId: string, status: 'available' | 'reserved' | 'paid'): Promise<number>;
  listByPurchase(purchaseId: string): Promise<RaffleTicket[]>;
  releaseExpired(): Promise<number>;
  findRandomPaid(raffleId: string): Promise<RaffleTicket | null>;
  countAvailable(raffleId: string): Promise<number>;
}
