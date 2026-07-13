import type { Product } from '@/core/domain/entities/product';
import type { ReadingProgress } from '@/core/domain/entities/reading-progress';
import { progressPercent } from '@/core/domain/entities/reading-progress';
import type { ProductRepository } from '@/core/application/ports/product-repository';
import type { PurchaseRepository } from '@/core/application/ports/purchase-repository';
import type { ProgressRepository } from '@/core/application/ports/progress-repository';
import type { SubscriptionRepository } from '@/core/application/ports/subscription-repository';
import type { PreviewAccessRepository } from '@/core/application/ports/preview-access-repository';

export type LibraryAccessType = 'premium' | 'preview' | 'admin';

export interface LibraryItem {
  product: Product;
  purchasedAt: string | null;
  progress: ReadingProgress | null;
  progressPct: number;
  lastAccessedAt: string | null;
  viaAdmin: boolean;
  accessType: LibraryAccessType;
}

export class GetUserLibrary {
  constructor(
    private readonly products: ProductRepository,
    private readonly purchases: PurchaseRepository,
    private readonly progress: ProgressRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly previewAccess: PreviewAccessRepository,
  ) {}

  async execute(userId: string, isAdmin = false): Promise<LibraryItem[]> {
    const [userPurchases, userSubs, userPreviews, allProgress] = await Promise.all([
      this.purchases.listByUser(userId),
      this.subscriptions.listByUser(userId),
      this.previewAccess.listByUser(userId),
      this.progress.listByUser(userId),
    ]);

    const paid = userPurchases.filter((p) => p.status === 'paid');
    const activeSubs = userSubs.filter((s) => s.status === 'active' || s.status === 'trialing');
    const progressByProduct = new Map(allProgress.map((p) => [p.productId, p]));
    const fullAccessIds = new Set([
      ...paid.map((p) => p.productId),
      ...activeSubs.map((s) => s.productId),
    ]);

    const result: LibraryItem[] = [];

    // Full access via purchases
    for (const purchase of paid) {
      const product = await this.products.findById(purchase.productId);
      if (!product || (!product.active && !isAdmin)) continue;
      const prog = progressByProduct.get(product.id) ?? null;
      result.push({
        product,
        purchasedAt: purchase.createdAt,
        progress: prog,
        progressPct: progressPercent(prog),
        lastAccessedAt: prog?.lastAccessedAt ?? null,
        viaAdmin: false,
        accessType: 'premium',
      });
    }

    // Full access via subscriptions (not already covered by purchase)
    for (const sub of activeSubs) {
      if (paid.some((p) => p.productId === sub.productId)) continue;
      const product = await this.products.findById(sub.productId);
      if (!product || !product.active) continue;
      const prog = progressByProduct.get(product.id) ?? null;
      result.push({
        product,
        purchasedAt: sub.createdAt,
        progress: prog,
        progressPct: progressPercent(prog),
        lastAccessedAt: prog?.lastAccessedAt ?? null,
        viaAdmin: false,
        accessType: 'premium',
      });
    }

    // Preview access via invite
    for (const pa of userPreviews) {
      if (fullAccessIds.has(pa.productId)) continue;
      const product = await this.products.findById(pa.productId);
      if (!product || !product.active) continue;
      const prog = progressByProduct.get(product.id) ?? null;
      result.push({
        product,
        purchasedAt: pa.createdAt,
        progress: prog,
        progressPct: progressPercent(prog),
        lastAccessedAt: prog?.lastAccessedAt ?? null,
        viaAdmin: false,
        accessType: 'preview',
      });
    }

    // Admin: sees all active products not already listed
    if (isAdmin) {
      const active = await this.products.listActive();
      for (const product of active) {
        if (fullAccessIds.has(product.id) || userPreviews.some((p) => p.productId === product.id))
          continue;
        const prog = progressByProduct.get(product.id) ?? null;
        result.push({
          product,
          purchasedAt: null,
          progress: prog,
          progressPct: progressPercent(prog),
          lastAccessedAt: prog?.lastAccessedAt ?? null,
          viaAdmin: true,
          accessType: 'admin',
        });
      }
    }

    return result;
  }
}
