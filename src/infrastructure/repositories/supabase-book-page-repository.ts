import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookPageRepository } from '@/core/application/ports/book-page-repository';
import type { BookPage } from '@/core/domain/entities/book-page';

interface BookPageRow {
  id: string;
  product_id: string;
  page_index: number;
  preview_enabled: boolean;
  created_at: string;
  updated_at: string;
}

function toBookPage(row: BookPageRow): BookPage {
  return {
    id: row.id,
    productId: row.product_id,
    pageIndex: row.page_index,
    previewEnabled: row.preview_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseBookPageRepository implements BookPageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByProduct(productId: string): Promise<BookPage[]> {
    const { data, error } = await this.db
      .from('book_pages')
      .select('*')
      .eq('product_id', productId)
      .order('page_index', { ascending: true })
      .returns<BookPageRow[]>();
    if (error) throw error;
    return (data ?? []).map(toBookPage);
  }

  async findByProductAndIndex(productId: string, pageIndex: number): Promise<BookPage | null> {
    const { data, error } = await this.db
      .from('book_pages')
      .select('*')
      .eq('product_id', productId)
      .eq('page_index', pageIndex)
      .maybeSingle<BookPageRow>();
    if (error) throw error;
    return data ? toBookPage(data) : null;
  }

  async upsert(productId: string, pageIndex: number, previewEnabled: boolean): Promise<BookPage> {
    const { data, error } = await this.db
      .from('book_pages')
      .upsert(
        { product_id: productId, page_index: pageIndex, preview_enabled: previewEnabled },
        { onConflict: 'product_id,page_index' },
      )
      .select('*')
      .single<BookPageRow>();
    if (error) throw error;
    return toBookPage(data);
  }

  async listPreviewIndices(productId: string): Promise<number[]> {
    const { data, error } = await this.db
      .from('book_pages')
      .select('page_index')
      .eq('product_id', productId)
      .eq('preview_enabled', true)
      .order('page_index', { ascending: true })
      .returns<{ page_index: number }[]>();
    if (error) throw error;
    return (data ?? []).map((r) => r.page_index);
  }
}
