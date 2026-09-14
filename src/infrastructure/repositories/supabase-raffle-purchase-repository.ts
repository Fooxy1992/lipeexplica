import type { SupabaseClient } from '@supabase/supabase-js';
import type { RafflePurchase, RafflePurchaseStatus } from '@/core/domain/entities/raffle-purchase';
import type {
  RafflePurchaseRepository,
  CreateRafflePurchaseInput,
} from '@/core/application/ports/raffle-purchase-repository';
import type { RafflePurchaseRow } from '@/infrastructure/supabase/database.types';
import { toRafflePurchase } from './mappers';

export class SupabaseRafflePurchaseRepository implements RafflePurchaseRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateRafflePurchaseInput): Promise<RafflePurchase> {
    const { data, error } = await this.db
      .from('raffle_purchases')
      .insert({
        raffle_id: input.raffleId,
        ticket_quantity: input.ticketQuantity,
        amount_cents: input.amountCents,
        buyer_name: input.buyerName,
        buyer_email: input.buyerEmail,
        buyer_phone: input.buyerPhone,
      })
      .select('*')
      .single<RafflePurchaseRow>();
    if (error) throw error;
    return toRafflePurchase(data);
  }

  async findBySessionId(sessionId: string): Promise<RafflePurchase | null> {
    const { data, error } = await this.db
      .from('raffle_purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle<RafflePurchaseRow>();
    if (error) throw error;
    return data ? toRafflePurchase(data) : null;
  }

  async findByToken(token: string): Promise<RafflePurchase | null> {
    const { data, error } = await this.db
      .from('raffle_purchases')
      .select('*')
      .eq('confirmation_token', token)
      .maybeSingle<RafflePurchaseRow>();
    if (error) throw error;
    return data ? toRafflePurchase(data) : null;
  }

  async updateStatus(id: string, status: RafflePurchaseStatus, sessionId?: string): Promise<void> {
    const { error } = await this.db
      .from('raffle_purchases')
      .update({ status, ...(sessionId ? { stripe_session_id: sessionId } : {}) })
      .eq('id', id);
    if (error) throw error;
  }

  async listByRaffle(raffleId: string): Promise<RafflePurchase[]> {
    const { data, error } = await this.db
      .from('raffle_purchases')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('created_at', { ascending: false })
      .returns<RafflePurchaseRow[]>();
    if (error) throw error;
    return (data ?? []).map(toRafflePurchase);
  }

  async listByEmail(email: string): Promise<RafflePurchase[]> {
    const { data, error } = await this.db
      .from('raffle_purchases')
      .select('*')
      .eq('buyer_email', email.toLowerCase())
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .returns<RafflePurchaseRow[]>();
    if (error) throw error;
    return (data ?? []).map(toRafflePurchase);
  }
}
