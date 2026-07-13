import type { PreviewAccess } from '@/core/domain/entities/preview-access';

export interface PreviewAccessRepository {
  grant(userId: string, productId: string, inviteId: string | null): Promise<PreviewAccess>;
  find(userId: string, productId: string): Promise<PreviewAccess | null>;
  listByUser(userId: string): Promise<PreviewAccess[]>;
}
