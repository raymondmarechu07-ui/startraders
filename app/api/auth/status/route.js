import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = getSession(request);

  return NextResponse.json(
    {
      authenticated: !!session,
      expires_at: session?.expires_at ?? null,
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
