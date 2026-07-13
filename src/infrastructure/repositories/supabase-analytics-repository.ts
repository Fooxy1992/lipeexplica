import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsRepository } from '@/core/application/ports/analytics-repository';
import type { TrackEventInput } from '@/core/domain/entities/analytics-event';

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async track(input: TrackEventInput): Promise<void> {
    const { error } = await this.db.from('analytics_events').insert({
      user_id: input.userId,
      event: input.event,
      properties: input.properties ?? {},
      session_id: input.sessionId ?? null,
    });
    if (error) throw error;
  }
}
