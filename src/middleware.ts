import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const protectedPaths = ['/mein-bereich', '/einstellungen'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !req.auth?.user) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/mein-bereich/:path*', '/einstellungen/:path*'],
};
