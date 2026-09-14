import type { SupabaseClient } from '@supabase/supabase-js';
import type { Raffle, RaffleStatus } from '@/core/domain/entities/raffle';
import type { RaffleRepository } from '@/core/application/ports/raffle-repository';
import type { RaffleRow } from '@/infrastructure/supabase/database.types';
import { toRaffle } from './mappers';

export class SupabaseRaffleRepository implements RaffleRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findActive(): Promise<Raffle | null> {
    const { data, error } = await this.db
      .from('raffles')
      .select('*')
      .in('status', ['active', 'sold_out', 'drawing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<RaffleRow>();
    if (error) throw error;
    return data ? toRaffle(data) : null;
  }

  async findById(id: string): Promise<Raffle | null> {
    const { data, error } = await this.db
      .from('raffles')
      .select('*')
      .eq('id', id)
      .maybeSingle<RaffleRow>();
    if (error) throw error;
    return data ? toRaffle(data) : null;
  }

  async updateStatus(id: string, status: RaffleStatus, drawDate?: string): Promise<void> {
    const { error } = await this.db
      .from('raffles')
      .update({ status, ...(drawDate ? { draw_date: drawDate } : {}) })
      .eq('id', id);
    if (error) throw error;
  }

  async setWinner(id: string, winnerTicketId: string): Promise<void> {
    const { error } = await this.db
      .from('raffles')
      .update({ winner_ticket_id: winnerTicketId, status: 'completed' })
      .eq('id', id);
    if (error) throw error;
  }

  async listDueForDraw(): Promise<Raffle[]> {
    const { data, error } = await this.db
      .from('raffles')
      .select('*')
      .eq('status', 'sold_out')
      .lte('draw_date', new Date().toISOString())
      .returns<RaffleRow[]>();
    if (error) throw error;
    return (data ?? []).map(toRaffle);
  }
}
