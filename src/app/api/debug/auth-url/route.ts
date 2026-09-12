import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const h = await headers();
  const envVar = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = h.get("origin");
  const xHost = h.get("x-forwarded-host");
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto");

  let resolved = "(none)";
  if (envVar && !envVar.includes("localhost")) resolved = envVar;
  else if (xHost && !xHost.includes("localhost")) resolved = `${proto ?? "https"}://${xHost}`;
  else if (origin && !origin.includes("localhost")) resolved = origin;
  else resolved = envVar ?? "(undefined)";

  return NextResponse.json({
    resolved,
    envVar,
    origin,
    xHost,
    host,
    proto,
  });
}
