import type { Product } from "@/core/domain/entities/product";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  listActive(): Promise<Product[]>;
  listAll(): Promise<Product[]>;
  update(
    id: string,
    data: Partial<
      Pick<
        Product,
        "title" | "description" | "price" | "stripePriceId" | "active" | "cover"
      >
    >,
  ): Promise<void>;
}
