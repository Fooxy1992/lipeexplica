import type { BookPage } from '@/core/domain/entities/book-page';

export interface BookPageRepository {
  findByProduct(productId: string): Promise<BookPage[]>;
  findByProductAndIndex(productId: string, pageIndex: number): Promise<BookPage | null>;
  upsert(productId: string, pageIndex: number, previewEnabled: boolean): Promise<BookPage>;
  listPreviewIndices(productId: string): Promise<number[]>;
}
