export type RaffleTicketStatus = 'available' | 'reserved' | 'paid';

export interface RaffleTicket {
  id: string;
  raffleId: string;
  ticketNumber: number;
  status: RaffleTicketStatus;
  reservedUntil: string | null;
  purchaseId: string | null;
  createdAt: string;
}
