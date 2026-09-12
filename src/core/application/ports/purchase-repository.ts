import type { Purchase, PurchaseStatus } from "@/core/domain/entities/purchase";

export interface CreatePurchaseInput {
  userId: string;
  productId: string;
  stripePaymentIntent: string | null;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: PurchaseStatus;
}

export interface PurchaseRepository {
  create(input: CreatePurchaseInput): Promise<Purchase>;
  findById(id: string): Promise<Purchase | null>;
  findBySessionId(sessionId: string): Promise<Purchase | null>;
  listByUser(userId: string): Promise<Purchase[]>;
  userOwnsProduct(userId: string, productId: string): Promise<boolean>;
  listAll(limit?: number): Promise<Purchase[]>;
  updateStatus(id: string, status: PurchaseStatus): Promise<void>;
}
