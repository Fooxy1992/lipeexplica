import type { RafflePurchase, RafflePurchaseStatus } from '@/core/domain/entities/raffle-purchase';

export interface CreateRafflePurchaseInput {
  raffleId: string;
  ticketQuantity: number;
  amountCents: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
}

export interface RafflePurchaseRepository {
  create(input: CreateRafflePurchaseInput): Promise<RafflePurchase>;
  findBySessionId(sessionId: string): Promise<RafflePurchase | null>;
  findByToken(token: string): Promise<RafflePurchase | null>;
  updateStatus(id: string, status: RafflePurchaseStatus, sessionId?: string): Promise<void>;
  listByRaffle(raffleId: string): Promise<RafflePurchase[]>;
}
