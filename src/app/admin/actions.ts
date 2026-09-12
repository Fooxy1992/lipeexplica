"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  userScopedContainer,
  adminContainer,
  logger,
} from "@/infrastructure/di/container";
import { DomainError } from "@/core/domain/errors/domain-error";

/** Every admin action re-validates the admin flag server-side. */
async function assertAdmin(): Promise<string> {
  const c = await userScopedContainer();
  const {
    data: { user },
  } = await c.db.auth.getUser();
  if (!user) throw new DomainError("UNAUTHORIZED", "Não autenticado");
  const profile = await c.profiles.findById(user.id);
  if (!profile?.isAdmin) throw new DomainError("FORBIDDEN", "Sem permissão");
  return user.id;
}

/* ------------------------------------------------------------- PRODUTOS -- */

const updateProductSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  /** preço em reais no form (ex.: 47.00) → convertido pra centavos */
  priceReais: z.coerce.number().min(0).max(100_000),
  active: z.coerce.boolean(),
});

/**
 * Atualiza o produto e SINCRONIZA com o Stripe:
 * título/descrição via products.update; mudança de valor cria um Price novo
 * (Stripe não permite editar) e arquiva o antigo. O banco guarda o Price
 * vigente — o checkout passa a cobrar o valor novo imediatamente.
 */
export async function updateProduct(formData: FormData) {
  const adminId = await assertAdmin();
  const input = updateProductSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    priceReais: formData.get("priceReais"),
    active: formData.get("active") === "on",
  });
  const amountCents = Math.round(input.priceReais * 100);

  const c = adminContainer();
  const product = await c.products.findById(input.id);
  if (!product) throw new DomainError("NOT_FOUND", "Produto não encontrado");

  const { stripePriceId } = await c.payments.syncProductPrice({
    stripePriceId: product.stripePriceId,
    title: input.title,
    description: product.description,
    amountCents,
    currency: product.currency || "brl",
  });

  await c.products.update(input.id, {
    title: input.title,
    price: amountCents,
    stripePriceId,
    active: input.active,
  });

  logger.info("admin.product_updated", {
    adminId,
    productId: input.id,
    stripePriceId,
    amountCents,
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/50dinamicas");
}

/* -------------------------------------------------------------- COMPRAS -- */

const refundSchema = z.object({ purchaseId: z.string().uuid() });

/**
 * Reembolsa a compra: estorna no Stripe (quando há payment intent) E
 * revoga o acesso. Compras cortesia (sem intent) só revogam.
 */
export async function markPurchaseRefunded(formData: FormData) {
  const adminId = await assertAdmin();
  const { purchaseId } = refundSchema.parse({
    purchaseId: formData.get("purchaseId"),
  });

  const c = adminContainer();
  const purchase = await c.purchases.findById(purchaseId);
  if (!purchase) throw new DomainError("NOT_FOUND", "Compra não encontrada");
  if (purchase.status !== "paid") return;

  if (purchase.stripePaymentIntent) {
    // estorna primeiro; se o Stripe falhar, o status não muda
    await c.payments.refundPayment(purchase.stripePaymentIntent);
    logger.info("admin.stripe_refund_ok", {
      adminId,
      purchaseId,
      paymentIntent: purchase.stripePaymentIntent,
    });
  }

  await c.purchases.updateStatus(purchaseId, "refunded");

  logger.info("admin.purchase_refunded", { adminId, purchaseId });
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/users");
}

/* ------------------------------------------------------------- USUÁRIOS -- */

const userIdSchema = z.object({ userId: z.string().uuid() });

/** Alterna o flag de admin de um usuário (não permite remover o próprio). */
export async function toggleUserAdmin(formData: FormData) {
  const adminId = await assertAdmin();
  const { userId } = userIdSchema.parse({ userId: formData.get("userId") });

  if (userId === adminId) {
    throw new DomainError("VALIDATION", "Você não pode remover seu próprio admin");
  }

  const c = adminContainer();
  const { data, error } = await c.db
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single<{ is_admin: boolean }>();
  if (error) throw error;

  const { error: updateError } = await c.db
    .from("profiles")
    .update({ is_admin: !data.is_admin })
    .eq("id", userId);
  if (updateError) throw updateError;

  logger.info("admin.user_admin_toggled", {
    adminId,
    userId,
    isAdmin: !data.is_admin,
  });
  revalidatePath("/admin/users");
}

const grantSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
});

/** Concede acesso cortesia a um produto (compra manual, valor 0). */
export async function grantProductAccess(formData: FormData) {
  const adminId = await assertAdmin();
  const { userId, productId } = grantSchema.parse({
    userId: formData.get("userId"),
    productId: formData.get("productId"),
  });

  const c = adminContainer();
  const alreadyOwns = await c.purchases.userOwnsProduct(userId, productId);
  if (alreadyOwns) return;

  await c.purchases.create({
    userId,
    productId,
    stripePaymentIntent: null,
    stripeSessionId: `manual-${crypto.randomUUID()}`,
    amount: 0,
    currency: "brl",
    status: "paid",
  });

  logger.info("admin.access_granted", { adminId, userId, productId });
  revalidatePath("/admin/users");
  revalidatePath("/admin/purchases");
}

/**
 * Revoga TODO o acesso de um usuário a um produto: estorna no Stripe as
 * compras pagas com payment intent e marca todas como refunded.
 */
export async function revokeProductAccess(formData: FormData) {
  const adminId = await assertAdmin();
  const { userId, productId } = grantSchema.parse({
    userId: formData.get("userId"),
    productId: formData.get("productId"),
  });

  const c = adminContainer();
  const userPurchases = await c.purchases.listByUser(userId);
  const toRevoke = userPurchases.filter(
    (p) => p.productId === productId && p.status === "paid",
  );

  for (const p of toRevoke) {
    if (p.stripePaymentIntent) {
      await c.payments.refundPayment(p.stripePaymentIntent);
    }
    await c.purchases.updateStatus(p.id, "refunded");
  }

  logger.info("admin.access_revoked", { adminId, userId, productId });
  revalidatePath("/admin/users");
  revalidatePath("/admin/purchases");
}

/* ---------------------------------------------------------------- CUPONS -- */

const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/, "Só letras, números, - e _")
      .transform((s) => s.toUpperCase()),
    kind: z.enum(["percent", "amount"]),
    value: z.coerce.number().positive(),
    maxRedemptions: z.coerce.number().int().positive().optional(),
    expiresAt: z.string().optional(),
  })
  .refine((d) => (d.kind === "percent" ? d.value <= 100 : true), {
    message: "Percentual máximo 100",
  });

/** Cria cupom (Coupon + Promotion Code) direto no Stripe. */
export async function createCoupon(formData: FormData) {
  const adminId = await assertAdmin();
  const input = createCouponSchema.parse({
    code: formData.get("code"),
    kind: formData.get("kind"),
    value: formData.get("value"),
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });

  const c = adminContainer();
  await c.payments.createPromotionCode({
    code: input.code,
    percentOff: input.kind === "percent" ? input.value : undefined,
    amountOffCents:
      input.kind === "amount" ? Math.round(input.value * 100) : undefined,
    maxRedemptions: input.maxRedemptions,
    expiresAt: input.expiresAt,
  });

  logger.info("admin.coupon_created", { adminId, code: input.code });
  revalidatePath("/admin/coupons");
}

const toggleCouponSchema = z.object({
  promotionCodeId: z.string().min(1),
  active: z.enum(["true", "false"]),
});

export async function toggleCoupon(formData: FormData) {
  const adminId = await assertAdmin();
  const input = toggleCouponSchema.parse({
    promotionCodeId: formData.get("promotionCodeId"),
    active: formData.get("active"),
  });

  const c = adminContainer();
  await c.payments.setPromotionCodeActive(
    input.promotionCodeId,
    input.active === "true",
  );

  logger.info("admin.coupon_toggled", { adminId, id: input.promotionCodeId });
  revalidatePath("/admin/coupons");
}

/* -------------------------------------------------------------- CONVITES -- */

const createInviteSchema = z.object({
  productId: z.string().uuid(),
  accessType: z.enum(["full", "preview"]).default("full"),
  maxUses: z.coerce.number().int().min(1).max(1000).default(1),
  note: z.string().trim().max(200).optional(),
  expiresAt: z.string().optional(),
});

/** Cria link de convite para acesso pago fora do Stripe (Pix etc). */
export async function createInvite(formData: FormData) {
  const adminId = await assertAdmin();
  const input = createInviteSchema.parse({
    productId: formData.get("productId"),
    accessType: formData.get("accessType") || "full",
    maxUses: formData.get("maxUses") || 1,
    note: formData.get("note") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });

  const token = crypto.randomUUID().replace(/-/g, "");

  const c = adminContainer();
  const { error } = await c.db.from("invites").insert({
    token,
    product_id: input.productId,
    access_type: input.accessType,
    created_by: adminId,
    note: input.note ?? null,
    max_uses: input.maxUses,
    expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
  });
  if (error) throw error;

  logger.info("admin.invite_created", { adminId, productId: input.productId });
  revalidatePath("/admin/invites");
}

export async function toggleInvite(formData: FormData) {
  const adminId = await assertAdmin();
  const { inviteId, active } = z
    .object({ inviteId: z.string().uuid(), active: z.enum(["true", "false"]) })
    .parse({
      inviteId: formData.get("inviteId"),
      active: formData.get("active"),
    });

  const c = adminContainer();
  const { error } = await c.db
    .from("invites")
    .update({ active: active === "true" })
    .eq("id", inviteId);
  if (error) throw error;

  logger.info("admin.invite_toggled", { adminId, inviteId });
  revalidatePath("/admin/invites");
}

export async function deleteInvite(formData: FormData) {
  const adminId = await assertAdmin();
  const { inviteId } = z
    .object({ inviteId: z.string().uuid() })
    .parse({ inviteId: formData.get("inviteId") });

  const c = adminContainer();
  const { error } = await c.db.from("invites").delete().eq("id", inviteId);
  if (error) throw error;

  logger.info("admin.invite_deleted", { adminId, inviteId });
  revalidatePath("/admin/invites");
}

/* ---------------------------------------------------------------- LEADS -- */

export async function deleteLead(formData: FormData) {
  const adminId = await assertAdmin();
  const { leadId } = z
    .object({ leadId: z.string().uuid() })
    .parse({ leadId: formData.get("leadId") });

  const c = adminContainer();
  const { error } = await c.db.from("leads").delete().eq("id", leadId);
  if (error) throw error;

  logger.info("admin.lead_deleted", { adminId, leadId });
  revalidatePath("/admin/leads");
}
