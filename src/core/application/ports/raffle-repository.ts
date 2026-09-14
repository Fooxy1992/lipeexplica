import type { Raffle, RaffleStatus } from '@/core/domain/entities/raffle';

export interface RaffleRepository {
  findActive(): Promise<Raffle | null>;
  findById(id: string): Promise<Raffle | null>;
  updateStatus(id: string, status: RaffleStatus, drawDate?: string): Promise<void>;
  setWinner(id: string, winnerTicketId: string): Promise<void>;
  listDueForDraw(): Promise<Raffle[]>;
}
