/**
 * Configura o Stripe da plataforma (idempotente):
 * 1. Cria o Product + Price (BRL) do livro, se não existirem
 * 2. Cria o webhook endpoint de produção (checkout.session.completed)
 * 3. Grava ids/secret em scripts/stripe-setup.out.json (NÃO commitar)
 *
 * Uso: node scripts/setup-stripe.mjs
 * Lê STRIPE_SECRET_KEY de .env.local.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const key = env.match(/STRIPE_SECRET_KEY\s*=\s*(sk_[^\r\n]+)/)?.[1]?.trim();
if (!key) {
  console.error("STRIPE_SECRET_KEY não encontrada no .env.local");
  process.exit(1);
}

const stripe = new Stripe(key);
const WEBHOOK_URL = "https://www.lipeexplica.com/api/stripe/webhook";
const PRODUCT_NAME = "50 Dinâmicas para Jiu-Jitsu Infantil";
const PRICE_CENTS = 4700;

// --- Product (procura por nome antes de criar) --------------------------------
let product = (await stripe.products.search({ query: `name:'${PRODUCT_NAME}'` }))
  .data[0];
if (!product) {
  product = await stripe.products.create({
    name: PRODUCT_NAME,
    description:
      "Livro interativo com 50 dinâmicas práticas para professores de Jiu-Jitsu infantil. Acesso vitalício em lipeexplica.com/library.",
  });
  console.log("product criado:", product.id);
} else {
  console.log("product já existia:", product.id);
}

// --- Price ---------------------------------------------------------------------
let price = (
  await stripe.prices.list({ product: product.id, active: true, limit: 10 })
).data.find((p) => p.unit_amount === PRICE_CENTS && p.currency === "brl");
if (!price) {
  price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRICE_CENTS,
    currency: "brl",
  });
  console.log("price criado:", price.id);
} else {
  console.log("price já existia:", price.id);
}

// --- Webhook endpoint ------------------------------------------------------------
const existing = (await stripe.webhookEndpoints.list({ limit: 50 })).data.find(
  (w) => w.url === WEBHOOK_URL,
);
let webhookSecret = null;
let webhookId;
if (!existing) {
  const wh = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: ["checkout.session.completed"],
    description: "lipeexplica plataforma",
  });
  webhookSecret = wh.secret; // só disponível na criação
  webhookId = wh.id;
  console.log("webhook criado:", wh.id);
} else {
  webhookId = existing.id;
  console.log("webhook já existia:", existing.id, "(secret não recuperável — veja dashboard)");
}

writeFileSync(
  join(root, "scripts", "stripe-setup.out.json"),
  JSON.stringify({ productId: product.id, priceId: price.id, webhookId, webhookSecret }, null, 2),
);
console.log("PRICE_ID:", price.id);
console.log("resultado salvo em scripts/stripe-setup.out.json");
