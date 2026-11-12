/**
 * Sincroniza as assinaturas do Stripe com a tabela public.subscriptions
 * (idempotente — upsert por stripe_subscription_id).
 *
 * Serve para recuperar assinaturas pagas que o webhook não gravou
 * (antes da correção, nenhuma assinatura nova chegava ao banco).
 *
 * Uso:
 *   node scripts/sync-stripe-subscriptions.mjs           # só mostra o que faria
 *   node scripts/sync-stripe-subscriptions.mjs --apply   # grava no Supabase
 *
 * Lê de .env.local: STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = readFileSync(join(root, ".env.local"), "utf8");
const env = (name) =>
  envFile.match(new RegExp(`^\\s*${name}\\s*=\\s*["']?([^"'\\r\\n]+)`, "m"))?.[1]?.trim();

const stripeKey = env("STRIPE_SECRET_KEY");
const supabaseUrl = env("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
if (!stripeKey || !supabaseUrl || !serviceKey) {
  console.error(
    "Faltam variáveis no .env.local (STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
  );
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const stripe = new Stripe(stripeKey);
const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const toIso = (s) => (s ? new Date(s * 1000).toISOString() : null);

// Mapa email → user id (contas criadas pelo webhook no checkout)
const usersByEmail = new Map();
for (let page = 1; ; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  for (const u of data.users) if (u.email) usersByEmail.set(u.email.toLowerCase(), u.id);
  if (data.users.length < 1000) break;
}

let synced = 0;
let skipped = 0;
for await (const sub of stripe.subscriptions.list({ status: "all", expand: ["data.customer"] })) {
  const productId = sub.metadata?.product_id;
  const customer = sub.customer;
  const email = typeof customer === "object" && !customer.deleted ? customer.email : null;
  const label = `${sub.id} (${sub.status}, ${email ?? "sem email"})`;

  if (!productId) {
    console.log("ignorada — sem metadata.product_id:", label);
    skipped++;
    continue;
  }
  if (sub.status === "incomplete" || sub.status === "incomplete_expired") {
    console.log("ignorada — nunca foi paga:", label);
    skipped++;
    continue;
  }
  const userId = email ? usersByEmail.get(email.toLowerCase()) : undefined;
  if (!userId) {
    console.log("ignorada — nenhum usuário com esse email no Supabase:", label);
    skipped++;
    continue;
  }

  const item = sub.items.data[0];
  const row = {
    user_id: userId,
    product_id: productId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof customer === "string" ? customer : customer.id,
    stripe_price_id: item?.price.id ?? "",
    status: sub.status,
    current_period_start: toIso(item?.current_period_start),
    current_period_end: toIso(item?.current_period_end),
    cancel_at_period_end: sub.cancel_at_period_end,
    canceled_at: toIso(sub.canceled_at),
  };

  if (apply) {
    const { error } = await db
      .from("subscriptions")
      .upsert(row, { onConflict: "stripe_subscription_id" });
    if (error) {
      console.error("erro ao gravar", label, error.message);
      continue;
    }
  }
  console.log(apply ? "gravada:" : "seria gravada:", label);
  synced++;
}

console.log(`\n${synced} ${apply ? "gravada(s)" : "a gravar"}, ${skipped} ignorada(s).`);
if (!apply && synced > 0) console.log("Rode de novo com --apply para gravar.");
