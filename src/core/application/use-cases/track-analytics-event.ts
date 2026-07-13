import type { AnalyticsRepository } from '@/core/application/ports/analytics-repository';
import type { TrackEventInput } from '@/core/domain/entities/analytics-event';

export class TrackAnalyticsEvent {
  constructor(private readonly analytics: AnalyticsRepository) {}

  async execute(input: TrackEventInput): Promise<void> {
    await this.analytics.track(input);
  }
}
