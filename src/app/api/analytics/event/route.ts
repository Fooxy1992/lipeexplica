import { NextResponse } from 'next/server';
import { z } from 'zod';
import { userScopedContainer } from '@/infrastructure/di/container';
import { createRateLimiter, clientIp } from '@/infrastructure/security/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().max(64).optional(),
});

const limiter = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = limiter.check(`analytics:${ip}`);
  if (!rate.allowed) return new NextResponse(null, { status: 429 });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 422 });
  }

  try {
    const c = await userScopedContainer();
    const { data: { user } } = await c.db.auth.getUser();

    await c.trackAnalyticsEvent.execute({
      userId: user?.id ?? null,
      event: body.event,
      properties: body.properties,
      sessionId: body.sessionId,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
