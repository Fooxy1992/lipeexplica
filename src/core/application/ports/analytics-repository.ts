import type { TrackEventInput } from '@/core/domain/entities/analytics-event';

export interface AnalyticsRepository {
  track(input: TrackEventInput): Promise<void>;
}
