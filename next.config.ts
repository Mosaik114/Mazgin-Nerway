import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isProduction = process.env.NODE_ENV === 'production';

function buildSecurityHeaders() {
  const headers = [
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
    { key: 'Origin-Agent-Cluster', value: '?1' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ];

  if (isProduction) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    });
  }

  return headers;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [75, 86, 88, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/essays',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/essays/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'nerway.de' }],
        destination: 'https://www.nerway.de/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'mizginnerway.de' }],
        destination: 'https://www.nerway.de/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mizginnerway.de' }],
        destination: 'https://www.nerway.de/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
