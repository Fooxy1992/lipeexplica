"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { logger } from "@/infrastructure/di/container";
import { publicEnv } from "@/lib/env";

const emailSchema = z.string().trim().toLowerCase().email();

export interface AuthFormState {
  ok: boolean;
  message: string;
}

/** Sends a magic link. Never reveals whether the email exists. */
export async function signInWithMagicLink(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, message: "Digite um email válido." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // do NOT auto-create accounts here — accounts are created on purchase
      // (webhook) or via OAuth. Avoids junk signups from the login form.
      shouldCreateUser: false,
    },
  });

  if (error) {
    logger.warn("auth.magic_link_failed", { error: error.message });
    // Same message on failure/success: no user enumeration.
  }

  logger.info("auth.magic_link_requested");
  return {
    ok: true,
    message:
      "Se este email possui uma conta, você receberá um link de acesso em instantes.",
  };
}

/** Login com email + senha (usado por admins e quem preferir senha). */
export async function signInWithPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = z.string().min(6).safeParse(formData.get("password"));
  if (!email.success || !password.success) {
    return { ok: false, message: "Email ou senha inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });

  if (error) {
    logger.warn("auth.password_login_failed", { error: error.message });
    return { ok: false, message: "Email ou senha incorretos." };
  }

  logger.info("auth.password_login_success");
  redirect("/library");
}

/** OAuth sign-in (Google live; Apple prepared — enable in Supabase). */
export async function signInWithOAuth(provider: "google" | "apple") {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    logger.warn("auth.oauth_failed", { provider, error: error?.message });
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
