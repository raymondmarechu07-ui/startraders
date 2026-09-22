import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const DTRADER_ORIGIN = 'https://startraders-dtrader.pages.dev';
const HANDOFF_TTL_MS = 60 * 1000;

function store() {
  if (!globalThis.__starTradersHandoffs) {
    globalThis.__starTradersHandoffs = new Map();
  }
  return globalThis.__starTradersHandoffs;
}

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', DTRADER_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function POST(request) {
  const session = getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const code = crypto.randomBytes(32).toString('base64url');
  store().set(code, {
    access_token: session.access_token,
    refresh_token: session.refresh_token || null,
    expires_at: session.expires_at,
    created_at: Date.now(),
  });

  return cors(
    NextResponse.json({
      ok: true,
      code,
      expiresIn: HANDOFF_TTL_MS,
    })
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return cors(NextResponse.json({ error: 'Missing handoff code.' }, { status: 400 }));
  }

  const entry = store().get(code);
  store().delete(code);

  if (!entry || Date.now() - entry.created_at > HANDOFF_TTL_MS) {
    return cors(NextResponse.json({ error: 'Invalid or expired handoff code.' }, { status: 401 }));
  }

  return cors(
    NextResponse.json({
      access_token: entry.access_token,
      refresh_token: entry.refresh_token,
      expires_at: entry.expires_at,
    })
  );
}
