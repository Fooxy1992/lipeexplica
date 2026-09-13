import { NextResponse } from "next/server";
import { z } from "zod";
import { userScopedContainer, logger } from "@/infrastructure/di/container";
import {
  createRateLimiter,
  clientIp,
} from "@/infrastructure/security/rate-limit";
import { DomainError, httpStatusFor } from "@/core/domain/errors/domain-error";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({
  productId: z.string().uuid(),
});

// 10 checkout attempts / minute / IP
const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

/**
 * POST /api/checkout
 * Body: { productId } — nothing else is trusted from the frontend.
 * Price comes from the product's Stripe Price, validated server-side.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = limiter.check(`checkout:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um instante." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let productId: string;
  try {
    const json = await request.json();
    productId = bodySchema.parse(json).productId;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 422 });
  }

  try {
    const c = await userScopedContainer();

    // logged-in users get their email prefilled at Stripe Checkout
    const {
      data: { user },
    } = await c.db.auth.getUser();

    const { url } = await c.createCheckoutSession.execute({
      productId,
      customerEmail: user?.email,
      siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
    });

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof DomainError) {
      logger.warn("checkout.domain_error", { code: err.code, message: err.message });
      return NextResponse.json(
        { error: err.message },
        { status: httpStatusFor[err.code] },
      );
    }
    logger.error("checkout.unexpected_error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Erro ao iniciar o checkout" },
      { status: 500 },
    );
  }
}
