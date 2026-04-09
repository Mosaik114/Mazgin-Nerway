import { Role } from '@prisma/client';
import type { Session } from 'next-auth';
import { describe, expect, it } from 'vitest';
import { getSignInPageDecision, resolveProtectedRoute } from './auth-flow';
import { buildSignInPath, getSafeCallbackUrl, resolveSignedInRedirect } from './auth-redirect';

function createSession(): Session {
  return {
    user: {
      id: 'user-1',
      role: Role.USER,
      isBlocked: false,
      email: 'user@example.com',
      name: 'Test User',
      image: null,
    },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

describe('auth flow decisions', () => {
  it('keeps authenticated users on protected pages without forcing login', () => {
    const decision = resolveProtectedRoute(createSession(), '/mein-bereich');
    expect(decision.type).toBe('allow');
  });

  it('redirects unauthenticated users on protected pages to signin with callback', () => {
    const decision = resolveProtectedRoute(null, '/einstellungen');
    expect(decision).toEqual({
      type: 'redirect',
      location: '/auth/signin?callbackUrl=%2Feinstellungen',
    });
  });

  it('redirects authenticated users away from /auth/signin to callback instead of restarting oauth', () => {
    const decision = getSignInPageDecision({
      callbackParam: '/mein-bereich',
      isAuthenticated: true,
      hasGoogleOAuthConfig: true,
    });
    expect(decision).toEqual({
      type: 'redirect',
      location: '/mein-bereich',
    });
  });

  it('prevents redirect loops when callback points back to signin routes', () => {
    expect(resolveSignedInRedirect('/auth/signin')).toBe('/');
    expect(resolveSignedInRedirect('/auth/signin/google?callbackUrl=%2F')).toBe('/');
  });

  it('starts oauth flow for unauthenticated users when google config exists', () => {
    const decision = getSignInPageDecision({
      callbackParam: '/mein-bereich',
      isAuthenticated: false,
      hasGoogleOAuthConfig: true,
    });
    expect(decision).toEqual({
      type: 'redirect',
      location: '/auth/signin/google?callbackUrl=%2Fmein-bereich',
    });
  });

  it('shows fallback signin page when oauth is not configured', () => {
    const decision = getSignInPageDecision({
      callbackParam: '/mein-bereich',
      isAuthenticated: false,
      hasGoogleOAuthConfig: false,
    });
    expect(decision).toEqual({ type: 'show-missing-config' });
  });
});

describe('auth redirect helpers', () => {
  it('sanitizes unsafe callback urls and builds stable signin urls', () => {
    expect(getSafeCallbackUrl('https://example.com/evil')).toBe('/');
    expect(buildSignInPath('https://example.com/evil')).toBe('/auth/signin?callbackUrl=%2F');
  });
});
