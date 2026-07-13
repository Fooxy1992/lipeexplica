import type { SupabaseClient } from '@supabase/supabase-js';
import type { PreviewAccessRepository } from '@/core/application/ports/preview-access-repository';
import type { PreviewAccess } from '@/core/domain/entities/preview-access';

interface PreviewAccessRow {
  id: string;
  user_id: string;
  product_id: string;
  invite_id: string | null;
  created_at: string;
}

function toPreviewAccess(row: PreviewAccessRow): PreviewAccess {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    inviteId: row.invite_id,
    createdAt: row.created_at,
  };
}

export class SupabasePreviewAccessRepository implements PreviewAccessRepository {
  constructor(private readonly db: SupabaseClient) {}

  async grant(userId: string, productId: string, inviteId: string | null): Promise<PreviewAccess> {
    const { data, error } = await this.db
      .from('preview_access')
      .upsert(
        { user_id: userId, product_id: productId, invite_id: inviteId },
        { onConflict: 'user_id,product_id' },
      )
      .select('*')
      .single<PreviewAccessRow>();
    if (error) throw error;
    return toPreviewAccess(data);
  }

  async find(userId: string, productId: string): Promise<PreviewAccess | null> {
    const { data, error } = await this.db
      .from('preview_access')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle<PreviewAccessRow>();
    if (error) throw error;
    return data ? toPreviewAccess(data) : null;
  }

  async listByUser(userId: string): Promise<PreviewAccess[]> {
    const { data, error } = await this.db
      .from('preview_access')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<PreviewAccessRow[]>();
    if (error) throw error;
    return (data ?? []).map(toPreviewAccess);
  }
}
