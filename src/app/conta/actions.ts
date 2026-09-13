"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { userScopedContainer, logger } from "@/infrastructure/di/container";

export interface AccountFormState {
  ok: boolean;
  message: string;
}

/** Digits only, 10 or 11 for BR numbers (with or without the country code). */
const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), {
    message: "Telefone inválido. Use DDD + número.",
  });

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80, "Nome muito longo"),
  phone: phoneSchema,
});

/** Updates the fields the user owns on their own profile. */
export async function updateProfile(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();
  if (!user) return { ok: false, message: "Sessão expirada. Entre novamente." };

  try {
    await c.profiles.updateOwn(user.id, {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    });
  } catch (err) {
    logger.error("account.profile_update_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, message: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/conta");
  revalidatePath("/library");
  return { ok: true, message: "Dados atualizados." };
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem.",
  });

/**
 * Sets or replaces the account password. Buyers arrive through a magic link
 * and never have one, so this is the only way to opt into password login.
 */
export async function setPassword(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Senha inválida." };
  }

  const c = await userScopedContainer();
  const { error } = await c.db.auth.updateUser({ password: parsed.data.password });

  if (error) {
    logger.warn("account.password_update_failed", { error: error.message });
    return { ok: false, message: "Não foi possível atualizar a senha. Tente novamente." };
  }

  logger.info("account.password_updated");
  return { ok: true, message: "Senha definida. Agora você também pode entrar com email e senha." };
}
