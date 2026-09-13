import { NextResponse } from 'next/server';
import { adminContainer, userScopedContainer, logger } from '@/infrastructure/di/container';
import { publicEnv } from '@/lib/env';

export const runtime = 'nodejs';

/** POST /api/portal — returns Stripe Customer Portal URL for logged-in user. */
export async function POST(request: Request) {
  try {
    const c = await userScopedContainer();
    const { data: { user } } = await c.db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    // Find active subscription to get stripe_customer_id
    const subs = await c.subscriptions.listByUser(user.id);
    const active = subs.find((s) => s.status === 'active' || s.status === 'trialing');
    if (!active) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 404 });
    }

    const adm = adminContainer();
    const { url } = await adm.payments.createCustomerPortal({
      stripeCustomerId: active.stripeCustomerId,
      returnUrl: `${publicEnv.NEXT_PUBLIC_SITE_URL}/library?aba=conta`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    logger.error('portal.error', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Erro ao abrir portal' }, { status: 500 });
  }
}
