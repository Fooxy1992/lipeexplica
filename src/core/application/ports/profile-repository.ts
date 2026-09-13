import type { Profile } from "@/core/domain/entities/profile";

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  listAll(limit?: number): Promise<Profile[]>;
  upsert(
    profile: Pick<Profile, "id"> & Partial<Omit<Profile, "id" | "createdAt">>,
  ): Promise<void>;
  /**
   * Updates the fields a user owns. Plain UPDATE, not upsert: the row is
   * created by a trigger on signup, and RLS grants update-own but no insert,
   * so an INSERT ... ON CONFLICT would be rejected even when the row exists.
   */
  updateOwn(
    id: string,
    fields: { name?: string | null; phone?: string | null },
  ): Promise<void>;
}
