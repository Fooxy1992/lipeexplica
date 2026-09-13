import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Server Supabase client bound to the request cookies (RLS enforced,
 * acts as the logged-in user). Use in Server Components / Route Handlers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component: middleware refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * Anon client with no session attached. For server-side jobs that must act as
 * an anonymous caller — e.g. asking GoTrue to email a magic link from the
 * Stripe webhook, where there are no cookies to bind to.
 */
export function createSupabaseAnonClient() {
  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/**
 * Admin client (service role — BYPASSES RLS). Server-only.
 * Used exclusively by the Stripe webhook and admin use cases.
 */
export function createSupabaseAdminClient() {
  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
