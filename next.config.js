/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const engine = 'https://trading-bot-template.onrender.com';
    return {
      beforeFiles: [
        // Keep /bot-builder on StarTraders' own branded Next.js page.
        // Mount the full DBot engine under a dedicated path while source-level integration proceeds.
        { source: '/bot-builder/engine', destination: `${engine}/` },
        { source: '/bot-builder/engine/:path*', destination: `${engine}/:path*` },
      ],
    };
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https://*.deriv.com https://*.derivws.com https://cdn.jsdelivr.net https://unpkg.com",
      "worker-src 'self' blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://auth.deriv.com https://api.derivws.com https://api-core.deriv.com https://*.deriv.com https://*.derivws.com https://cdn.jsdelivr.net https://unpkg.com https://fonts.gstatic.com wss://*.deriv.com wss://*.derivws.com",
      "base-uri 'self'",
      "form-action 'self' https://auth.deriv.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
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
