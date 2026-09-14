export type RaffleStatus = 'active' | 'sold_out' | 'drawing' | 'completed';

export interface Raffle {
  id: string;
  title: string;
  prizeName: string;
  prizeImageUrl: string | null;
  totalTickets: number;
  status: RaffleStatus;
  drawDate: string | null;
  winnerTicketId: string | null;
  createdAt: string;
}
