import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/infrastructure/supabase/server';
import { SupabaseProfileRepository } from '@/infrastructure/repositories/supabase-profile-repository';
import { SupabaseSubscriptionRepository } from '@/infrastructure/repositories/supabase-subscription-repository';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Assinaturas' };
export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const db = await createSupabaseServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect('/login');

  const profiles = new SupabaseProfileRepository(db);
  const profile = await profiles.findById(user.id);
  if (!profile?.isAdmin) redirect('/library');

  const admin = createSupabaseAdminClient();
  const subscriptionRepo = new SupabaseSubscriptionRepository(admin);
  const subs = await subscriptionRepo.listAll(200);

  const active = subs.filter((s) => s.status === 'active' || s.status === 'trialing').length;
  const canceled = subs.filter((s) => s.status === 'canceled').length;
  const pastDue = subs.filter((s) => s.status === 'past_due').length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-foreground">Assinaturas</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Ativas', value: active, color: '#22c55e' },
          { label: 'Canceladas', value: canceled, color: '#a1a1aa' },
          { label: 'Em atraso', value: pastDue, color: '#FF4D2D' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-black" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-3">Stripe Subscription</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Próx. cobrança</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {s.stripeSubscriptionId.slice(0, 20)}…
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.currentPeriodStart ? formatDate(s.currentPeriodStart) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : '—'}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma assinatura ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#22c55e',
    trialing: '#3b82f6',
    past_due: '#f59e0b',
    canceled: '#a1a1aa',
    unpaid: '#ef4444',
    paused: '#8b5cf6',
    incomplete: '#f59e0b',
  };
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ background: colors[status] ?? '#a1a1aa' }}
    >
      {status}
    </span>
  );
}
