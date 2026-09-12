import { NextResponse } from "next/server";
import { z } from "zod";
import { userScopedContainer, logger } from "@/infrastructure/di/container";
import { DomainError, httpStatusFor } from "@/core/domain/errors/domain-error";

export const runtime = "nodejs";

const bodySchema = z.object({
  productId: z.string().uuid(),
  lastPage: z.number().int().min(0).max(10_000),
  totalPages: z.number().int().min(0).max(10_000),
  visited: z.array(z.number().int().min(0).max(10_000)).max(10_000),
  favorites: z.array(z.number().int().min(0).max(10_000)).max(10_000),
});

/** POST /api/progress — persists reading progress for an owned product. */
export async function POST(request: Request) {
  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 422 });
  }

  try {
    await c.saveReadingProgress.execute({ userId: user.id, ...body });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json(
        { error: err.message },
        { status: httpStatusFor[err.code] },
      );
    }
    logger.error("progress.save_failed", {
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
