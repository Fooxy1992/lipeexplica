"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/infrastructure/supabase/server";
import { SupabaseAuthGateway } from "@/infrastructure/supabase/supabase-auth-gateway";
import { SupabasePurchaseRepository } from "@/infrastructure/repositories/supabase-purchase-repository";
import { logger } from "@/infrastructure/di/container";

export interface RedeemState {
  ok: boolean;
  message: string;
  /** email usado — mostrado na tela de sucesso */
  email?: string;
}

interface InviteRow {
  id: string;
  product_id: string;
  max_uses: number;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  access_type: 'full' | 'preview';
}

const schema = z.object({
  token: z.string().min(10).max(64),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

/**
 * Resgata um convite: valida token, cria/encontra a conta pelo email,
 * registra a compra (R$ 0, fora do Stripe) e consome um uso.
 * Se já houver sessão ativa, o acesso vai para a conta logada.
 */
export async function redeemInvite(
  _prev: RedeemState,
  formData: FormData,
): Promise<RedeemState> {
  const whatsappOptIn = formData.get("whatsapp_opt_in") === "on";
  const rawPhone = (formData.get("phone_number") as string | null)?.trim() ?? "";
  const phoneCode = (formData.get("phone_code") as string | null) ?? "+55";
  const phone = whatsappOptIn && rawPhone
    ? `${phoneCode}${rawPhone.replace(/\D/g, "")}`
    : null;

  const parsed = schema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Preencha todos os campos corretamente.";
    return { ok: false, message: msg };
  }
  const { token, name, email, password } = parsed.data;

  const admin = createSupabaseAdminClient();

  // Valida convite
  const { data: invite } = await admin
    .from("invites")
    .select("id, product_id, max_uses, used_count, active, expires_at, access_type")
    .eq("token", token)
    .maybeSingle<InviteRow>();

  if (
    !invite ||
    !invite.active ||
    invite.used_count >= invite.max_uses ||
    (invite.expires_at && new Date(invite.expires_at) < new Date())
  ) {
    return { ok: false, message: "Convite inválido, expirado ou já utilizado." };
  }

  // Sessão ativa? Resgata para a conta logada. Senão, cria/encontra pela do form.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  let userId: string;
  let userEmail: string;
  if (sessionUser) {
    userId = sessionUser.id;
    userEmail = sessionUser.email ?? email;
  } else {
    const auth = new SupabaseAuthGateway(admin);
    const created = await auth.findOrCreateUserByEmail(email, { name, password });
    userId = created.id;
    userEmail = created.email;
  }

  // Concede o acesso (idempotente por convite+usuário)
  if (invite.access_type === 'preview') {
    // Preview invite: grant partial access (not a full purchase)
    const { data: existing } = await admin
      .from('preview_access')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', invite.product_id)
      .maybeSingle();
    if (!existing) {
      await admin
        .from('preview_access')
        .insert({ user_id: userId, product_id: invite.product_id, invite_id: invite.id });
      // consome o uso só quando o acesso é novo
      await admin
        .from('invites')
        .update({ used_count: invite.used_count + 1 })
        .eq('id', invite.id);
    }
  } else {
    // Full invite: original behavior
    const purchases = new SupabasePurchaseRepository(admin);
    const alreadyOwns = await purchases.userOwnsProduct(userId, invite.product_id);
    if (!alreadyOwns) {
      await purchases.create({
        userId,
        productId: invite.product_id,
        stripePaymentIntent: null,
        stripeSessionId: `invite-${invite.id}-${crypto.randomUUID()}`,
        amount: 0,
        currency: "brl",
        status: "paid",
      });
      // consome o uso só quando o acesso é novo
      await admin
        .from("invites")
        .update({ used_count: invite.used_count + 1 })
        .eq("id", invite.id);
    }
  }

  if (phone) {
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { whatsapp_opt_in: true, whatsapp_phone: phone },
    });
  }

  logger.info("invite.redeemed", { inviteId: invite.id, userId });

  if (sessionUser) redirect("/library");

  // Auto-login com a senha definida — redireciona direto para a biblioteca
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password,
  });

  if (!signInError) {
    redirect("/library");
  }

  // Fallback: se o login falhar (conta já existia com outra senha), avisa o usuário
  return {
    ok: true,
    message: "Acesso liberado!",
    email: userEmail,
  };
}
