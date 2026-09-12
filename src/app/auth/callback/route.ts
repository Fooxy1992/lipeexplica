import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { logger } from "@/infrastructure/di/container";
import { publicEnv } from "@/lib/env";

const EMAIL_OTP_TYPES = [
  "magiclink",
  "recovery",
  "signup",
  "invite",
  "email",
  "email_change",
] as const;

type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function parseOtpType(value: string | null): EmailOtpType | null {
  return EMAIL_OTP_TYPES.includes(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null;
}

/**
 * OAuth / Magic Link / password recovery callback.
 * Redirects to the library (or ?next=... when present). Open redirects are
 * blocked: only local paths.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawNext = url.searchParams.get("next") ?? "/library";
  // allow only same-site relative paths
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/library";

  const success = new URL(next, publicEnv.NEXT_PUBLIC_SITE_URL);
  const failure = new URL("/login?error=auth", publicEnv.NEXT_PUBLIC_SITE_URL);

  const supabase = await createSupabaseServerClient();

  // Email links carry a token_hash: verified statelessly, so the link still
  // works when opened on a different device than the one that requested it.
  const tokenHash = url.searchParams.get("token_hash");
  const otpType = parseOtpType(url.searchParams.get("type"));
  if (tokenHash && otpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (!error) {
      logger.info("auth.login_success", { userId: data.user?.id, via: otpType });
      return NextResponse.redirect(success);
    }
    logger.warn("auth.verify_otp_failed", { type: otpType, error: error.message });
    return NextResponse.redirect(failure);
  }

  // OAuth: PKCE verifier lives in the browser that started the flow.
  const code = url.searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      logger.info("auth.login_success", { userId: data.user?.id, via: "oauth" });
      return NextResponse.redirect(success);
    }
    logger.warn("auth.code_exchange_failed", { error: error.message });
    return NextResponse.redirect(failure);
  }

  logger.warn("auth.callback_missing_params");
  return NextResponse.redirect(failure);
}
