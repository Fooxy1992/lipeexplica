import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductPlanRepository } from "@/core/application/ports/product-plan-repository";
import type { ProductPlan } from "@/core/domain/entities/product-plan";
import { toProductPlan } from "./mappers";

export class SupabaseProductPlanRepository implements ProductPlanRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listByProduct(productId: string): Promise<ProductPlan[]> {
    const { data, error } = await this.db
      .from("product_plans")
      .select("*")
      .eq("product_id", productId)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toProductPlan);
  }

  async findBySlug(productId: string, slug: string): Promise<ProductPlan | null> {
    const { data, error } = await this.db
      .from("product_plans")
      .select("*")
      .eq("product_id", productId)
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? toProductPlan(data) : null;
  }
}
