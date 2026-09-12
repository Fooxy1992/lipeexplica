import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server";
import { logger } from "@/infrastructure/di/container";
import {
  createRateLimiter,
  clientIp,
} from "@/infrastructure/security/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  source: z.enum(["newsletter", "contato"]).default("newsletter"),
  message: z.string().trim().max(2000).optional(),
});

// 5 leads/min por IP
const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });

/** POST /api/leads — captura de leads (newsletter / contato). */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!limiter.check(`leads:${ip}`).allowed) {
    return NextResponse.json({ error: "Aguarde um instante." }, { status: 429 });
  }

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  const db = createSupabaseAdminClient();
  const { error } = await db.from("leads").insert({
    email: input.email,
    name: input.name ?? null,
    phone: input.phone ?? null,
    source: input.source,
    message: input.message ?? null,
  });

  // unique (email, source) → repetido não é erro para o visitante
  if (error && !error.message.includes("duplicate")) {
    logger.error("leads.insert_failed", { error: error.message });
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }

  logger.info("leads.captured", { source: input.source });
  return NextResponse.json({ ok: true });
}
