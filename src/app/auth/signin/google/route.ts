import { signIn } from '@/auth';
import { resolveSignedInRedirect } from '@/lib/auth-redirect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const callbackUrl = resolveSignedInRedirect(request.nextUrl.searchParams.get('callbackUrl'));
  const authRedirectUrl = await signIn('google', { redirect: false, redirectTo: callbackUrl });

  if (typeof authRedirectUrl === 'string' && authRedirectUrl.trim()) {
    return NextResponse.redirect(new URL(authRedirectUrl, request.url));
  }

  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
