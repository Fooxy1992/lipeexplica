import { NextResponse } from 'next/server';
import { adminContainer } from '@/infrastructure/di/container';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const c = adminContainer();
    await c.raffleRepo.incrementViewCount(id);
    return NextResponse.json({ ok: true });
  } catch {
    // Never fail the client over a view count error
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
