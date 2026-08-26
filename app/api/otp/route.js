import { NextResponse } from 'next/server';
import { derivHeaders, getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { accountId } = await request.json().catch(() => ({}));
  if (!accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  const r = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${encodeURIComponent(accountId)}/otp`, { method: 'POST', headers: derivHeaders(session.access_token), cache: 'no-store' });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
