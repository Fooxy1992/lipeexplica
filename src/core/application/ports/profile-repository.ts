import type { Profile } from "@/core/domain/entities/profile";

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  listAll(limit?: number): Promise<Profile[]>;
  upsert(
    profile: Pick<Profile, "id"> & Partial<Omit<Profile, "id" | "createdAt">>,
  ): Promise<void>;
}
