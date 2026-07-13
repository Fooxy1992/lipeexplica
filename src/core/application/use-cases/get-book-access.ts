import { DomainError } from '@/core/domain/errors/domain-error';
import type { Product } from '@/core/domain/entities/product';
import type { ReadingProgress } from '@/core/domain/entities/reading-progress';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { PurchaseRepository } from '@/core/application/ports/purchase-repository';
import type { ProgressRepository } from '@/core/application/ports/progress-repository';
import type { ProfileRepository } from '@/core/application/ports/profile-repository';
import type { SubscriptionRepository } from '@/core/application/ports/subscription-repository';
import type { BookPageRepository } from '@/core/application/ports/book-page-repository';
import type { PreviewAccessRepository } from '@/core/application/ports/preview-access-repository';

export type BookAccessLevel = 'full' | 'preview';
export type BookAccessSource = 'admin' | 'subscription' | 'purchase' | 'invite';

export interface BookAccess {
  product: Product;
  progress: ReadingProgress | null;
  accessLevel: BookAccessLevel;
  accessSource: BookAccessSource;
  /** Indices of pages visible to preview users. Empty when accessLevel='full'. */
  previewPageIndices: number[];
}

export class GetBookAccess {
  constructor(
    private readonly products: ProductRepository,
    private readonly purchases: PurchaseRepository,
    private readonly progress: ProgressRepository,
    private readonly profiles: ProfileRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly bookPages: BookPageRepository,
    private readonly previewAccess: PreviewAccessRepository,
  ) {}

  async execute(userId: string, slug: string): Promise<BookAccess> {
    const product = await this.products.findBySlug(slug);
    if (!product) throw new DomainError('NOT_FOUND', 'Livro não encontrado');

    const profile = await this.profiles.findById(userId);

    // 1. Admin: always full access
    if (profile?.isAdmin) {
      const progress = await this.progress.find(userId, product.id);
      return {
        product,
        progress,
        accessLevel: 'full',
        accessSource: 'admin',
        previewPageIndices: [],
      };
    }

    if (!product.active) throw new DomainError('FORBIDDEN', 'Este produto não está mais ativo');

    // 2. Active subscription: full access
    const sub = await this.subscriptions.findActiveByUserProduct(userId, product.id);
    if (sub) {
      const progress = await this.progress.find(userId, product.id);
      return {
        product,
        progress,
        accessLevel: 'full',
        accessSource: 'subscription',
        previewPageIndices: [],
      };
    }

    // 3. One-time purchase: full access
    const owns = await this.purchases.userOwnsProduct(userId, product.id);
    if (owns) {
      const progress = await this.progress.find(userId, product.id);
      return {
        product,
        progress,
        accessLevel: 'full',
        accessSource: 'purchase',
        previewPageIndices: [],
      };
    }

    // 4. Preview invite: partial access
    const preview = await this.previewAccess.find(userId, product.id);
    if (preview) {
      const progress = await this.progress.find(userId, product.id);
      const previewPageIndices = await this.bookPages.listPreviewIndices(product.id);
      return {
        product,
        progress,
        accessLevel: 'preview',
        accessSource: 'invite',
        previewPageIndices,
      };
    }

    throw new DomainError('FORBIDDEN', 'Você não possui este produto');
  }
}
