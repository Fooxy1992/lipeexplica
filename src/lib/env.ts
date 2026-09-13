import { z } from "zod";

/**
 * Environment variables, validated once at module load.
 *
 * - `env` — server-only vars. Importing it in a client component throws.
 * - `publicEnv` — NEXT_PUBLIC_* vars, safe on both sides.
 */

const serverSchema = z.object({
  // Stripe é opcional no boot: páginas que não vendem (admin, biblioteca)
  // não podem depender dele. getStripe() valida na hora do uso.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  N8N_PAYMENT_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_TOKEN: z.string().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || undefined,
  NEXT_PUBLIC_GA_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined,
});

/**
 * Base URL for links emailed to users (magic link, recovery, access).
 * AUTH_REDIRECT_BASE_URL is server-only, so Turbopack never inlines a
 * localhost value into the production bundle.
 */
export function authBaseUrl(): string {
  const serverVar = process.env.AUTH_REDIRECT_BASE_URL;
  if (serverVar && !serverVar.includes("localhost")) return serverVar;
  return publicEnv.NEXT_PUBLIC_SITE_URL;
}

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/** Lazily-validated server env. Call only from server code. */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must never be called in the browser");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse({
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || undefined,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || undefined,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      N8N_PAYMENT_WEBHOOK_URL: process.env.N8N_PAYMENT_WEBHOOK_URL || undefined,
      N8N_WEBHOOK_TOKEN: process.env.N8N_WEBHOOK_TOKEN || undefined,
    });
  }
  return cachedServerEnv;
}
