import { NextResponse } from 'next/server';
import { derivHeaders, getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const r = await fetch('https://api.derivws.com/trading/v1/options/accounts', { headers: derivHeaders(session.access_token), cache: 'no-store' });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
