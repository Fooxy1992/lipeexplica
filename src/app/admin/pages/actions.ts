'use server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/infrastructure/supabase/server';
import { SupabaseBookPageRepository } from '@/infrastructure/repositories/supabase-book-page-repository';
import { SupabaseProfileRepository } from '@/infrastructure/repositories/supabase-profile-repository';

export async function togglePreviewPage(
  productId: string,
  pageIndex: number,
  previewEnabled: boolean,
): Promise<void> {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const profiles = new SupabaseProfileRepository(db);
  const profile = await profiles.findById(user.id);
  if (!profile?.isAdmin) throw new Error('Forbidden');

  const admin = createSupabaseAdminClient();
  const repo = new SupabaseBookPageRepository(admin);
  await repo.upsert(productId, pageIndex, previewEnabled);
}
