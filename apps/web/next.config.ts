import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

// connect-src 'self' is what makes "your files never leave your device" enforceable:
// the browser itself blocks this page from sending data to any other server.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
];

// English is served unprefixed ("/") and rewritten to the shared `app/[locale]` tree;
// "/en" redirects to "/" so there is a single canonical URL.
const nextConfig: NextConfig = {
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/guide', destination: '/guide', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/en' },
        { source: '/guide', destination: '/en/guide' },
      ],
    };
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
};

export default nextConfig;
