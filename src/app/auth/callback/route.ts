import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { logger } from "@/infrastructure/di/container";
import { publicEnv } from "@/lib/env";

/**
 * OAuth / Magic Link callback.
 * Exchanges the auth code for a session and redirects to the library
 * (or ?next=... when present). Open redirects are blocked: only local paths.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/library";
  // allow only same-site relative paths
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/library";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      logger.info("auth.login_success", { userId: data.user?.id });
      return NextResponse.redirect(new URL(next, publicEnv.NEXT_PUBLIC_SITE_URL));
    }
    logger.warn("auth.code_exchange_failed", { error: error.message });
  }

  return NextResponse.redirect(
    new URL("/login?error=auth", publicEnv.NEXT_PUBLIC_SITE_URL),
  );
}
