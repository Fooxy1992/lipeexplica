import type { ProductPlan } from "@/core/domain/entities/product-plan";

export interface ProductPlanRepository {
  /** Active plans of a product, cheapest tier first. */
  listByProduct(productId: string): Promise<ProductPlan[]>;
  findBySlug(productId: string, slug: string): Promise<ProductPlan | null>;
}
