import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware: refreshes the Supabase session cookie on every request and
 * gates protected areas. Fine-grained checks (purchase ownership, admin
 * flag) happen again server-side in each page — middleware is the first
 * fence, never the only one.
 */
const PROTECTED_PREFIXES = ["/library", "/books", "/dashboard", "/admin"];

/**
 * Throttle for the last_seen_at write: one UPDATE per user per window, marked
 * by a cookie so we never pay an extra SELECT to decide.
 */
const LAST_SEEN_COOKIE = "ls_ping";
const LAST_SEEN_WINDOW_SECONDS = 15 * 60;

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() validates the JWT against Supabase (not just the cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Activity heartbeat: auth.users.last_sign_in_at only moves on a fresh
  // sign-in, so a long-lived refreshed session looks inactive forever.
  const needsPing = user && !request.cookies.get(LAST_SEEN_COOKIE);
  if (needsPing) {
    const userId = user.id;
    event.waitUntil(
      (async () => {
        // Best effort: never let the heartbeat break a request.
        await supabase
          .from("profiles")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", userId);
      })().catch(() => undefined),
    );
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsPing) {
    response.cookies.set(LAST_SEEN_COOKIE, "1", {
      maxAge: LAST_SEEN_WINDOW_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
