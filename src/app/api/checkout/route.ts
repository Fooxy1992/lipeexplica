import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * RETIRED: one-time purchase.
 *
 * Both plans are monthly now, so there is no active one-time Stripe Price left
 * to charge. The endpoint answers 410 rather than 404 so an old cached page
 * hitting it gets a real explanation instead of looking broken — and so nobody
 * is charged against an archived price.
 *
 * Buyers who already paid keep lifetime access through their purchase rows.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "O pagamento único foi descontinuado. Escolha um plano mensal em /50dinamicas#comprar.",
    },
    { status: 410 },
  );
}
