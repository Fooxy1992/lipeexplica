export type RafflePurchaseStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface RafflePurchase {
  id: string;
  raffleId: string;
  stripeSessionId: string | null;
  ticketQuantity: number;
  amountCents: number;
  status: RafflePurchaseStatus;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  confirmationToken: string;
  createdAt: string;
}
