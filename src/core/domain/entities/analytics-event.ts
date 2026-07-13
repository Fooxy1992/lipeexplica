export interface AnalyticsEvent {
  id: number;
  userId: string | null;
  event: string;
  properties: Record<string, unknown>;
  sessionId: string | null;
  createdAt: string;
}

export type TrackEventInput = {
  userId: string | null;
  event: string;
  properties?: Record<string, unknown>;
  sessionId?: string | null;
};
