import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const session = getSession(request);
  return NextResponse.json({ authenticated: Boolean(session), expiresAt: session?.expires_at || null });
}
