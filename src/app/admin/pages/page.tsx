import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/infrastructure/supabase/server';
import { SupabaseProfileRepository } from '@/infrastructure/repositories/supabase-profile-repository';
import { SupabaseBookPageRepository } from '@/infrastructure/repositories/supabase-book-page-repository';
import { SupabaseProductRepository } from '@/infrastructure/repositories/supabase-product-repository';
import { BookPagesAdminForm } from './book-pages-admin-form';

export const metadata: Metadata = { title: 'Admin — Páginas do Livro' };
export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const db = await createSupabaseServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect('/login');

  const profiles = new SupabaseProfileRepository(db);
  const profile = await profiles.findById(user.id);
  if (!profile?.isAdmin) redirect('/library');

  const admin = createSupabaseAdminClient();
  const products = new SupabaseProductRepository(admin);
  const bookPageRepo = new SupabaseBookPageRepository(admin);

  const allProducts = await products.listActive();
  const product = allProducts[0]; // 50 dinâmicas
  if (!product) return <p className="p-8 text-white">Nenhum produto encontrado.</p>;

  const pages = await bookPageRepo.findByProduct(product.id);

  // Fill missing pages (0-49) with defaults
  const pagesMap = new Map(pages.map((p) => [p.pageIndex, p]));
  const allPages = Array.from({ length: 50 }, (_, i) => ({
    pageIndex: i,
    previewEnabled: pagesMap.get(i)?.previewEnabled ?? false,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Páginas do Livro — {product.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Marque as páginas visíveis no modo preview (convites de demonstração).
      </p>
      <BookPagesAdminForm productId={product.id} pages={allPages} />
    </div>
  );
}
