/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Security headers. The CSP below is intentionally scoped to exactly
  // what this app needs to talk to: itself, Deriv's OAuth/API domains,
  // and Deriv's WebSocket. Nothing else is allowed to load or connect,
  // which is what stops an injected/malicious script from doing
  // anything useful even if one ever got onto the page.
  async headers() {
    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' is needed because some components here use
      // inline <style> tags (e.g. the callback page's spinner
      // animation) — this does not weaken script protection below.
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      // Only these are allowed to be contacted for data/API calls.
      "connect-src 'self' https://auth.deriv.com https://api.derivws.com https://*.deriv.com wss://api.derivws.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://auth.deriv.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
