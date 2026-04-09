import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

function getAnalyticsOrigin(rawUrl?: string): string | null {
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function buildContentSecurityPolicy(nonce: string): string {
  const analyticsOrigin = getAnalyticsOrigin(process.env.NEXT_PUBLIC_UMAMI_URL);
  const connectSrc = ["'self'"];

  if (analyticsOrigin) {
    connectSrc.push(analyticsOrigin);
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}'`,
    `connect-src ${connectSrc.join(' ')}`,
  ];

  if (isProduction) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

function createNonce(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function middleware(request: NextRequest) {
  const nonce = createNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy(nonce));

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

