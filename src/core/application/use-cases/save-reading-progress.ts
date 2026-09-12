import { DomainError } from "@/core/domain/errors/domain-error";
import type { ReadingProgress } from "@/core/domain/entities/reading-progress";
import type { PurchaseRepository } from "@/core/application/ports/purchase-repository";
import type { ProgressRepository } from "@/core/application/ports/progress-repository";
import type { ProfileRepository } from "@/core/application/ports/profile-repository";

export interface SaveProgressInput {
  userId: string;
  productId: string;
  lastPage: number;
  totalPages: number;
  visited: number[];
  favorites: number[];
}

/** Persists reading progress. Dono do produto ou admin. */
export class SaveReadingProgress {
  constructor(
    private readonly purchases: PurchaseRepository,
    private readonly progress: ProgressRepository,
    private readonly profiles: ProfileRepository,
  ) {}

  async execute(input: SaveProgressInput): Promise<void> {
    const [owns, profile] = await Promise.all([
      this.purchases.userOwnsProduct(input.userId, input.productId),
      this.profiles.findById(input.userId),
    ]);
    if (!owns && !profile?.isAdmin)
      throw new DomainError("FORBIDDEN", "Você não possui este produto");

    const record: ReadingProgress = {
      userId: input.userId,
      productId: input.productId,
      lastPage: input.lastPage,
      totalPages: input.totalPages,
      visited: [...new Set(input.visited)].sort((a, b) => a - b),
      favorites: [...new Set(input.favorites)].sort((a, b) => a - b),
      completed:
        input.totalPages > 0 &&
        new Set(input.visited).size >= input.totalPages,
      lastAccessedAt: new Date().toISOString(),
    };

    await this.progress.upsert(record);
  }
}
