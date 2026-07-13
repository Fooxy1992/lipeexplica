'use server';

import { createSupabaseAdminClient } from '@/infrastructure/supabase/server';
import { SupabaseBookPageRepository } from '@/infrastructure/repositories/supabase-book-page-repository';

export async function togglePreviewPage(
  productId: string,
  pageIndex: number,
  previewEnabled: boolean,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const repo = new SupabaseBookPageRepository(admin);
  await repo.upsert(productId, pageIndex, previewEnabled);
}
