import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret } from '@/infrastructure/stripe/stripe-client';
import { adminContainer, logger } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const log = logger.child({ scope: 'stripe.webhook' });

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  } catch (err) {
    log.warn('webhook.invalid_signature', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const c = adminContainer();

  const { data: seen } = await c.db
    .from('webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();
  if (seen) {
    log.info('webhook.duplicate_event', { eventId: event.id });
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      // ---- ONE-TIME PAYMENT ----
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          // ── RIFA ────────────────────────────────────────────────────────────
          if (session.metadata?.type === 'raffle') {
            await c.confirmRafflePayment.execute({ stripeSessionId: session.id });
            break;
          }
          // ── PRODUTO NORMAL ──────────────────────────────────────────────────
          const productId = session.metadata?.product_id;
          const email = session.customer_details?.email ?? session.customer_email;
          if (productId && email) {
            await c.handleCheckoutCompleted.execute({
              sessionId: session.id,
              paymentIntent:
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : (session.payment_intent?.id ?? null),
              productId,
              customerEmail: email,
              customerName: session.customer_details?.name ?? null,
              customerPhone: session.customer_details?.phone ?? null,
              amountTotal: session.amount_total ?? 0,
              currency: session.currency ?? 'brl',
            });
          }
        }
        // Subscription checkout: create subscription + user
        if (session.mode === 'subscription') {
          await c.handleSubscriptionWebhook.handleCheckoutCompleted(session);
        }
        break;
      }

      // ---- SUBSCRIPTION LIFECYCLE ----
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted(event.data.object);
        break;

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted({ ...sub, status: 'canceled' });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const stripeSubId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (stripeSubId) {
          const existing = await c.subscriptions.findByStripeId(stripeSubId);
          if (existing) {
            await c.subscriptions.upsert({ ...existing, status: 'active' });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const stripeSubId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (stripeSubId) {
          const existing = await c.subscriptions.findByStripeId(stripeSubId);
          if (existing) {
            await c.subscriptions.upsert({ ...existing, status: 'past_due' });
          }
        }
        break;
      }

      case 'customer.subscription.paused': {
        const sub = event.data.object;
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted({ ...sub, status: 'paused' });
        break;
      }

      case 'customer.subscription.resumed': {
        const sub = event.data.object;
        await c.handleSubscriptionWebhook.handleSubscriptionUpserted({ ...sub, status: 'active' });
        break;
      }

      case 'customer.subscription.trial_will_end':
        log.info('webhook.trial_will_end', { subId: event.data.object.id });
        break;

      default:
        log.info('webhook.ignored_event', { type: event.type });
    }

    await c.db.from('webhook_events').insert({
      id: event.id,
      type: event.type,
      payload: { livemode: event.livemode },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    log.error('webhook.processing_failed', {
      eventId: event.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
