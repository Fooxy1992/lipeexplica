import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/core/domain/entities/product";
import type { ProductRepository } from "@/core/application/ports/product-repository";
import type { ProductRow } from "@/infrastructure/supabase/database.types";
import { toProduct } from "./mappers";

export class SupabaseProductRepository implements ProductRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle<ProductRow>();
    if (error) throw error;
    return data ? toProduct(data) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<ProductRow>();
    if (error) throw error;
    return data ? toProduct(data) : null;
  }

  async listActive(): Promise<Product[]> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .returns<ProductRow[]>();
    if (error) throw error;
    return (data ?? []).map(toProduct);
  }

  async listAll(): Promise<Product[]> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ProductRow[]>();
    if (error) throw error;
    return (data ?? []).map(toProduct);
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        Product,
        "title" | "description" | "price" | "stripePriceId" | "active" | "cover"
      >
    >,
  ): Promise<void> {
    const patch: Partial<ProductRow> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.price !== undefined) patch.price = data.price;
    if (data.stripePriceId !== undefined)
      patch.stripe_price_id = data.stripePriceId;
    if (data.active !== undefined) patch.active = data.active;
    if (data.cover !== undefined) patch.cover = data.cover;

    const { error } = await this.db.from("products").update(patch).eq("id", id);
    if (error) throw error;
  }
}
