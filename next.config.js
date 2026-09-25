/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/manual-trader-engine',
        destination: '/manual-trader',
        permanent: false,
      },
      {
        source: '/manual-trader-engine/',
        destination: '/manual-trader/',
        permanent: false,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/manual-trader',
        destination: '/manual-trader/index.html',
      },
      {
        source: '/manual-trader/',
        destination: '/manual-trader/index.html',
      },
    ];
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "worker-src 'self' blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://auth.deriv.com https://api.derivws.com https://api-core.deriv.com https://*.deriv.com wss://api.derivws.com wss://api-core.deriv.com",      "base-uri 'self'",
      "form-action 'self' https://auth.deriv.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
