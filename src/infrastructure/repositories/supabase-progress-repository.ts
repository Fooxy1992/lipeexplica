import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReadingProgress } from "@/core/domain/entities/reading-progress";
import type { ProgressRepository } from "@/core/application/ports/progress-repository";
import type { ReadingProgressRow } from "@/infrastructure/supabase/database.types";
import { toReadingProgress } from "./mappers";

export class SupabaseProgressRepository implements ProgressRepository {
  constructor(private readonly db: SupabaseClient) {}

  async find(
    userId: string,
    productId: string,
  ): Promise<ReadingProgress | null> {
    const { data, error } = await this.db
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle<ReadingProgressRow>();
    if (error) throw error;
    return data ? toReadingProgress(data) : null;
  }

  async listByUser(userId: string): Promise<ReadingProgress[]> {
    const { data, error } = await this.db
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .returns<ReadingProgressRow[]>();
    if (error) throw error;
    return (data ?? []).map(toReadingProgress);
  }

  async upsert(p: ReadingProgress): Promise<void> {
    const { error } = await this.db.from("reading_progress").upsert(
      {
        user_id: p.userId,
        product_id: p.productId,
        last_page: p.lastPage,
        total_pages: p.totalPages,
        visited: p.visited,
        favorites: p.favorites,
        completed: p.completed,
        last_accessed_at: p.lastAccessedAt,
      },
      { onConflict: "user_id,product_id" },
    );
    if (error) throw error;
  }
}
