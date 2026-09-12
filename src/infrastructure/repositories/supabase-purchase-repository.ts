import type { SupabaseClient } from "@supabase/supabase-js";
import type { Purchase, PurchaseStatus } from "@/core/domain/entities/purchase";
import type {
  CreatePurchaseInput,
  PurchaseRepository,
} from "@/core/application/ports/purchase-repository";
import type { PurchaseRow } from "@/infrastructure/supabase/database.types";
import { toPurchase } from "./mappers";

export class SupabasePurchaseRepository implements PurchaseRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreatePurchaseInput): Promise<Purchase> {
    const { data, error } = await this.db
      .from("purchases")
      .insert({
        user_id: input.userId,
        product_id: input.productId,
        stripe_payment_intent: input.stripePaymentIntent,
        stripe_session_id: input.stripeSessionId,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
      })
      .select("*")
      .single<PurchaseRow>();
    if (error) throw error;
    return toPurchase(data);
  }

  async findById(id: string): Promise<Purchase | null> {
    const { data, error } = await this.db
      .from("purchases")
      .select("*")
      .eq("id", id)
      .maybeSingle<PurchaseRow>();
    if (error) throw error;
    return data ? toPurchase(data) : null;
  }

  async findBySessionId(sessionId: string): Promise<Purchase | null> {
    const { data, error } = await this.db
      .from("purchases")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle<PurchaseRow>();
    if (error) throw error;
    return data ? toPurchase(data) : null;
  }

  async listByUser(userId: string): Promise<Purchase[]> {
    const { data, error } = await this.db
      .from("purchases")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<PurchaseRow[]>();
    if (error) throw error;
    return (data ?? []).map(toPurchase);
  }

  async userOwnsProduct(userId: string, productId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("status", "paid");
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async listAll(limit = 100): Promise<Purchase[]> {
    const { data, error } = await this.db
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<PurchaseRow[]>();
    if (error) throw error;
    return (data ?? []).map(toPurchase);
  }

  async updateStatus(id: string, status: PurchaseStatus): Promise<void> {
    const { error } = await this.db
      .from("purchases")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
  }
}
