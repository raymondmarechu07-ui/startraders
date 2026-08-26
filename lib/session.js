import crypto from 'crypto';

function unbase64url(value) { return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64'); }

export function unseal(value) {
  const [ivB64, tagB64, dataB64] = value.split('.');
  if (!ivB64 || !tagB64 || !dataB64 || !process.env.SESSION_SECRET) throw new Error('Invalid session');
  const key = crypto.createHash('sha256').update(process.env.SESSION_SECRET).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, unbase64url(ivB64));
  decipher.setAuthTag(unbase64url(tagB64));
  return JSON.parse(Buffer.concat([decipher.update(unbase64url(dataB64)), decipher.final()]).toString('utf8'));
}

export function getSession(request) {
  const raw = request.cookies.get('st_session')?.value;
  if (!raw) return null;
  try {
    const session = unseal(raw);
    if (!session.access_token || session.expires_at <= Date.now()) return null;
    return session;
  } catch { return null; }
}

export function derivHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Deriv-App-ID': process.env.DERIV_APP_ID,
    'Content-Type': 'application/json',
  };
}
