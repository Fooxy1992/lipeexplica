import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RifaConfirmacaoRedirect({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/acao/confirmacao/${token}`);
}
