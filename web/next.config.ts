import type { NextConfig } from 'next';

// CAP_BUILD=1 makes the static bundle that Capacitor ships inside the APK (no API routes, see scripts/build-app.mjs).
const app = process.env.CAP_BUILD === '1';

const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const config: NextConfig = app
  ? { output: 'export', trailingSlash: true, images: { unoptimized: true } }
  : {
      poweredByHeader: false,
      async headers() {
        return [{ source: '/:path*', headers: security }];
      },
    };

export default config;
