import { notFound, redirect } from "next/navigation";
import { userScopedContainer, logger } from "@/infrastructure/di/container";
import { DomainError } from "@/core/domain/errors/domain-error";
import { getBookReader } from "@/components/book/book-registry";
import { ForbiddenScreen } from "@/components/book/forbidden-screen";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /books/[slug] — the product itself. Defense in depth:
 * middleware (session) → this page (purchase + active product) → RLS.
 */
export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await userScopedContainer();

  const {
    data: { user },
  } = await c.db.auth.getUser();
  if (!user) redirect(`/login?next=/books/${encodeURIComponent(slug)}`);

  try {
    const { product, progress, accessLevel, previewPageIndices } = await c.getBookAccess.execute(user.id, slug);

    const Reader = getBookReader(product.slug);
    if (!Reader) {
      logger.error("book.reader_not_registered", { slug: product.slug });
      notFound();
    }

    logger.info("book.opened", { userId: user.id, productId: product.id, accessLevel });

    // Contabiliza o acesso (open_count + last_accessed_at) — RLS-safe RPC
    await c.db
      .rpc("log_book_access", { p_product_id: product.id })
      .then(({ error: rpcError }) => {
        if (rpcError) logger.warn("book.access_log_failed", { error: rpcError.message });
      });

    // Non-fatal: analytics failure must never break the book reader
    await c.trackAnalyticsEvent.execute({
      userId: user.id,
      event: 'book.opened',
      properties: { productId: product.id, accessLevel },
    }).catch((trackErr) => {
      logger.warn('book.analytics_track_failed', { error: String(trackErr) });
    });

    return (
      <Reader
        productId={product.id}
        initialProgress={
          progress
            ? {
                lastPage: progress.lastPage,
                visited: progress.visited,
                favorites: progress.favorites,
                completed: progress.completed,
              }
            : null
        }
        accessLevel={accessLevel}
        previewPageIndices={previewPageIndices}
      />
    );
  } catch (err) {
    if (err instanceof DomainError) {
      if (err.code === "NOT_FOUND") notFound();
      if (err.code === "FORBIDDEN") {
        logger.warn("book.access_denied", { userId: user.id, slug });
        return <ForbiddenScreen slug={slug} />;
      }
    }
    throw err;
  }
}
