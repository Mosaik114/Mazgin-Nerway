import { signIn } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

function getSafeCallbackUrl(rawCallbackUrl: string): string {
  const callbackUrl = rawCallbackUrl.trim();
  if (!callbackUrl) {
    return '/';
  }

  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }

  return '/';
}

export async function GET(request: NextRequest) {
  const callbackUrl = getSafeCallbackUrl(request.nextUrl.searchParams.get('callbackUrl') ?? '/');
  const authRedirectUrl = await signIn('google', { redirect: false, redirectTo: callbackUrl });

  if (typeof authRedirectUrl === 'string' && authRedirectUrl.trim()) {
    return NextResponse.redirect(new URL(authRedirectUrl, request.url));
  }

  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
