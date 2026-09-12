import Stripe from "stripe";
import { serverEnv } from "@/lib/env";

let stripe: Stripe | null = null;

/** Singleton Stripe SDK instance (server-only). */
export function getStripe(): Stripe {
  if (!stripe) {
    const key = serverEnv().STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY não configurada — checkout indisponível até configurar o Stripe",
      );
    }
    stripe = new Stripe(key, { typescript: true });
  }
  return stripe;
}

/** Webhook signing secret; lança erro claro se ausente. */
export function getStripeWebhookSecret(): string {
  const secret = serverEnv().STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET não configurada");
  }
  return secret;
}
