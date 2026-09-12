import type { ReadingProgress } from "@/core/domain/entities/reading-progress";

export interface ProgressRepository {
  find(userId: string, productId: string): Promise<ReadingProgress | null>;
  listByUser(userId: string): Promise<ReadingProgress[]>;
  upsert(progress: ReadingProgress): Promise<void>;
}
