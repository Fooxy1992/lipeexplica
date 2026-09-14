import type { SupabaseClient } from '@supabase/supabase-js';
import type { RaffleTicket } from '@/core/domain/entities/raffle-ticket';
import type { RaffleTicketRepository, ReservedTickets } from '@/core/application/ports/raffle-ticket-repository';
import type { RaffleTicketRow } from '@/infrastructure/supabase/database.types';
import { toRaffleTicket } from './mappers';
import { DomainError } from '@/core/domain/errors/domain-error';

export class SupabaseRaffleTicketRepository implements RaffleTicketRepository {
  constructor(private readonly db: SupabaseClient) {}

  async reserveTickets(raffleId: string, quantity: number, purchaseId: string): Promise<ReservedTickets> {
    const { data, error } = await this.db.rpc('reserve_raffle_tickets', {
      p_raffle_id: raffleId,
      p_quantity: quantity,
      p_purchase_id: purchaseId,
    });
    if (error) {
      if (error.message.includes('INSUFFICIENT_TICKETS')) {
        throw new DomainError('CONFLICT', 'Bilhetes insuficientes disponíveis');
      }
      throw error;
    }
    const rows = (data ?? []) as Array<{ id: string; ticket_number: number }>;
    const tickets: RaffleTicket[] = rows.map((r) => ({
      id: r.id,
      raffleId,
      ticketNumber: r.ticket_number,
      status: 'reserved' as const,
      reservedUntil: null,
      purchaseId,
      createdAt: new Date().toISOString(),
    }));
    return { tickets };
  }

  async markAsPaid(purchaseId: string): Promise<void> {
    const { error } = await this.db
      .from('raffle_tickets')
      .update({ status: 'paid', reserved_until: null })
      .eq('purchase_id', purchaseId);
    if (error) throw error;
  }

  async countByStatus(raffleId: string, status: 'available' | 'reserved' | 'paid'): Promise<number> {
    const { count, error } = await this.db
      .from('raffle_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('raffle_id', raffleId)
      .eq('status', status);
    if (error) throw error;
    return count ?? 0;
  }

  async listByPurchase(purchaseId: string): Promise<RaffleTicket[]> {
    const { data, error } = await this.db
      .from('raffle_tickets')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('ticket_number', { ascending: true })
      .returns<RaffleTicketRow[]>();
    if (error) throw error;
    return (data ?? []).map(toRaffleTicket);
  }

  async releaseExpired(): Promise<number> {
    const { data, error } = await this.db
      .from('raffle_tickets')
      .update({ status: 'available', reserved_until: null, purchase_id: null })
      .eq('status', 'reserved')
      .lt('reserved_until', new Date().toISOString())
      .select('id');
    if (error) throw error;
    return (data ?? []).length;
  }

  async findRandomPaid(raffleId: string): Promise<RaffleTicket | null> {
    // Busca todos os pagos e sorteia no JS — seguro para 200 bilhetes
    const { data, error } = await this.db
      .from('raffle_tickets')
      .select('*')
      .eq('raffle_id', raffleId)
      .eq('status', 'paid')
      .returns<RaffleTicketRow[]>();
    if (error) throw error;
    if (!data || data.length === 0) return null;
    const idx = Math.floor(Math.random() * data.length);
    const row = data[idx];
    if (!row) return null;
    return toRaffleTicket(row);
  }

  async countAvailable(raffleId: string): Promise<number> {
    const now = new Date().toISOString();
    const { count, error } = await this.db
      .from('raffle_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('raffle_id', raffleId)
      .or(`status.eq.available,and(status.eq.reserved,reserved_until.lt.${now})`);
    if (error) throw error;
    return count ?? 0;
  }
}
