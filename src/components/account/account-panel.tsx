import Link from "next/link";
import { Receipt } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Product } from "@/core/domain/entities/product";
import type { Purchase } from "@/core/domain/entities/purchase";
import type { Profile } from "@/core/domain/entities/profile";
import type { RafflePurchase } from "@/core/domain/entities/raffle-purchase";
import {
  isActiveSubscription,
  type Subscription,
} from "@/core/domain/entities/subscription";
import { ProfileForm, PasswordForm, ManageSubscriptionButton } from "./account-forms";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  refunded: "Reembolsado",
  failed: "Falhou",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E4EAF4] sm:p-8">
      <h2 className="font-display text-lg font-bold text-[#1C1E2E]">{title}</h2>
      <p className="mt-1 text-sm text-[#8B92A8]">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * Account settings, rendered as a tab of the library rather than its own page:
 * the library is where buyers land, and splitting "my stuff" from "my account"
 * across two routes only hid the settings.
 */
export function AccountPanel({
  user,
  profile,
  purchases,
  subscriptions,
  products,
  rafflePurchases = [],
}: {
  user: User;
  profile: Profile | null;
  purchases: Purchase[];
  subscriptions: Subscription[];
  products: Product[];
  rafflePurchases?: Array<{ purchase: RafflePurchase; ticketNumbers: number[] }>;
}) {
  const productTitle = new Map(products.map((p) => [p.id, p.title]));
  const activeSub = subscriptions.find(isActiveSubscription);

  return (
    <div className="space-y-6">
      <Section
        title="Dados pessoais"
        description="Usamos o telefone para falar com você no WhatsApp."
      >
        <p className="-mt-2 mb-5 text-sm text-[#8B92A8]">
          Conectado como <strong className="text-[#1C1E2E]">{user.email}</strong>
        </p>
        <ProfileForm name={profile?.name ?? null} phone={profile?.phone ?? null} />
      </Section>

      <Section
        title="Senha"
        description="Se você entra pelo link mágico do email, defina uma senha para também poder entrar direto."
      >
        <PasswordForm />
      </Section>

      <Section
        title="Compras"
        description="Todo pagamento aprovado libera o acesso automaticamente."
      >
        {purchases.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-[#E4EAF4] py-10 text-center">
            <Receipt className="h-5 w-5 text-[#B0B8CC]" />
            <p className="mt-3 text-sm text-[#8B92A8]">
              Nenhuma compra registrada ainda.
            </p>
            <Link
              href="/50dinamicas#comprar"
              className="mt-3 text-xs font-semibold text-[#FF4D2D] underline-offset-4 hover:underline"
            >
              Conhecer os produtos
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#E4EAF4]">
            {purchases.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-[#1C1E2E]">
                    {productTitle.get(p.productId) ?? "Produto"}
                  </p>
                  <p className="text-xs text-[#8B92A8]">
                    {formatDate(p.createdAt)}
                    {p.status !== "paid"
                      ? ` · ${STATUS_LABEL[p.status] ?? p.status}`
                      : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#1C1E2E]">
                  {p.amount === 0
                    ? "Cortesia"
                    : formatPrice(p.amount, p.currency.toUpperCase())}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {rafflePurchases.length > 0 && (
        <Section
          title="Minhas Ações"
          description="Ações compradas na ação solidária."
        >
          <ul className="space-y-4">
            {rafflePurchases.map(({ purchase, ticketNumbers }) => (
              <li key={purchase.id} className="rounded-xl border border-[#E4EAF4] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#1C1E2E]">
                      {purchase.ticketQuantity} ação{purchase.ticketQuantity > 1 ? 'ões' : ''}
                    </p>
                    <p className="text-xs text-[#8B92A8]">
                      {formatDate(purchase.createdAt)} ·{' '}
                      {(purchase.amountCents / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/acao/confirmacao/${purchase.confirmationToken}`}
                    className="text-xs font-semibold text-[#FF4D2D] underline-offset-4 hover:underline"
                  >
                    Ver comprovante
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ticketNumbers.map((n) => (
                    <span
                      key={n}
                      className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs text-amber-700"
                    >
                      #{n}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {activeSub ? (
        <Section
          title="Assinatura"
          description={
            activeSub.cancelAtPeriodEnd
              ? "Sua assinatura será encerrada no fim do período atual."
              : "Altere o cartão, veja as faturas ou cancele quando quiser."
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-[#8B92A8]">
              {productTitle.get(activeSub.productId) ?? "Assinatura"}
              {activeSub.currentPeriodEnd
                ? ` · ${activeSub.cancelAtPeriodEnd ? "acaba em" : "renova em"} ${formatDate(activeSub.currentPeriodEnd)}`
                : ""}
            </p>
            <ManageSubscriptionButton />
          </div>
        </Section>
      ) : null}
    </div>
  );
}
