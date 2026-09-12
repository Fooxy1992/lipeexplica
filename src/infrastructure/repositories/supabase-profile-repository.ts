import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/core/domain/entities/profile";
import type { ProfileRepository } from "@/core/application/ports/profile-repository";
import type { ProfileRow } from "@/infrastructure/supabase/database.types";
import { toProfile } from "./mappers";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.db
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle<ProfileRow>();
    if (error) throw error;
    return data ? toProfile(data) : null;
  }

  async listAll(limit = 100): Promise<Profile[]> {
    const { data, error } = await this.db
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<ProfileRow[]>();
    if (error) throw error;
    return (data ?? []).map(toProfile);
  }

  async upsert(
    profile: Pick<Profile, "id"> & Partial<Omit<Profile, "id" | "createdAt">>,
  ): Promise<void> {
    const patch: Record<string, unknown> = { id: profile.id };
    if (profile.name !== undefined) patch.name = profile.name;
    if (profile.avatar !== undefined) patch.avatar = profile.avatar;
    if (profile.phone !== undefined) patch.phone = profile.phone;
    // is_admin intentionally NOT settable through this path

    const { error } = await this.db
      .from("profiles")
      .upsert(patch, { onConflict: "id" });
    if (error) throw error;
  }
}
