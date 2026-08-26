// lib/deriv.js
// Everything needed to talk to Deriv: the OAuth login URL, parsing the
// callback Deriv sends the user back to, and a WebSocket connection
// that authorizes and streams the account balance.
//
// Honesty note: this follows Deriv's documented OAuth + WebSocket
// pattern as I know it. Deriv's exact response field names can change,
// so if something here doesn't match what actually comes back, check
// https://developers.deriv.com against this file rather than assuming
// this file is right.

export const DERIV_APP_ID =
  process.env.NEXT_PUBLIC_DERIV_APP_ID || '347G9qq93rOzy8QJF7DMA';

const DERIV_WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`;
const DERIV_OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_APP_ID}&l=en`;

// Deriv sends the user back to whichever redirect URL is passed here,
// as long as it exactly matches one registered on your Deriv app.
// We build it from window.location.origin so it's correct whether
// you're testing on localhost (with https), Netlify, or production —
// no hardcoding a single environment's URL.
export function getOAuthUrl() {
  if (typeof window === 'undefined') return DERIV_OAUTH_URL;
  const redirectUri = `${window.location.origin}/callback`;
  return `${DERIV_OAUTH_URL}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// Deriv redirects back with query params like:
//   ?acct1=CR123456&token1=a1-xxxx&cur1=USD&acct2=VRTC123456&token2=a1-yyyy&cur2=USD
// One numbered group per account the user approved (their real account,
// their demo account, or both). This pulls that apart into a plain array.
export function parseOAuthCallback(searchParams) {
  const accounts = [];
  let i = 1;
  while (searchParams.has(`acct${i}`)) {
    accounts.push({
      loginid: searchParams.get(`acct${i}`),
      token: searchParams.get(`token${i}`),
      currency: searchParams.get(`cur${i}`),
      // Deriv's demo/virtual account login IDs start with "VRTC".
      isDemo: (searchParams.get(`acct${i}`) || '').startsWith('VRTC'),
    });
    i++;
  }
  return accounts;
}

// A small wrapper around the raw WebSocket so the rest of the app
// doesn't have to deal with connection state, message IDs, or
// re-subscribing by hand.
export class DerivConnection {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // msg_type -> Set of callback fns
    this.reqId = 1;
    this.pending = new Map(); // req_id -> {resolve, reject}
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(DERIV_WS_URL);
      } catch (err) {
        reject(err);
        return;
      }

      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);

      this.ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (data.req_id && this.pending.has(data.req_id)) {
          const { resolve: res, reject: rej } = this.pending.get(data.req_id);
          this.pending.delete(data.req_id);
          if (data.error) rej(data.error);
          else res(data);
        }

        const type = data.msg_type;
        if (type && this.listeners.has(type)) {
          this.listeners.get(type).forEach((cb) => cb(data));
        }
      };

      this.ws.onclose = () => {
        const closeListeners = this.listeners.get('__close');
        if (closeListeners) closeListeners.forEach((cb) => cb());
      };
    });
  }

  // Sends a request and resolves with the matching response
  // (matched by req_id), rather than the raw fire-and-forget send.
  send(payload) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }
      const req_id = this.reqId++;
      this.pending.set(req_id, { resolve, reject });
      this.ws.send(JSON.stringify({ ...payload, req_id }));
    });
  }

  on(msgType, callback) {
    if (!this.listeners.has(msgType)) this.listeners.set(msgType, new Set());
    this.listeners.get(msgType).add(callback);
    return () => this.listeners.get(msgType)?.delete(callback);
  }

  authorize(token) {
    return this.send({ authorize: token });
  }

  subscribeBalance() {
    return this.send({ balance: 1, subscribe: 1 });
  }

  subscribeTicks(symbol) {
    return this.send({ ticks: symbol, subscribe: 1 });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
