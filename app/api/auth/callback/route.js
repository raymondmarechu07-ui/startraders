import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function seal(value) {
  const key = crypto.createHash('sha256').update(process.env.SESSION_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map(base64url).join('.');
}
function base64url(buffer) { return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const cookieState = request.cookies.get('st_oauth_state')?.value;
  const verifier = request.cookies.get('st_oauth_verifier')?.value;

  if (error) return NextResponse.redirect(new URL(`/callback?error=${encodeURIComponent(error)}`, origin));
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL('/callback?error=state_mismatch', origin));
  }
  if (!verifier) return NextResponse.redirect(new URL('/callback?error=missing_pkce_verifier', origin));

  const clientId = process.env.DERIV_CLIENT_ID;
  const redirectUri = process.env.DERIV_REDIRECT_URI;
  if (!clientId || !redirectUri || !process.env.SESSION_SECRET) {
    return NextResponse.redirect(new URL('/callback?error=server_configuration', origin));
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });

  try {
    const tokenResponse = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) {
      console.error('Deriv token exchange failed:', tokenResponse.status, token.error || token.errors || 'unknown');
      return NextResponse.redirect(new URL('/callback?error=token_exchange_failed', origin));
    }

    const session = {
      access_token: token.access_token,
      refresh_token: token.refresh_token || null,
      expires_at: Date.now() + Number(token.expires_in || 3600) * 1000,
    };

    const response = NextResponse.redirect(new URL('/callback?success=1', origin));
    response.cookies.set('st_session', seal(JSON.stringify(session)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.max(300, Number(token.expires_in || 3600)),
    });
    response.cookies.delete('st_oauth_state');
    response.cookies.delete('st_oauth_verifier');
    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/callback?error=callback_failed', origin));
  }
}
