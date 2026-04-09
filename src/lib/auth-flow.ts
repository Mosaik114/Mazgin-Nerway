import type { Session } from 'next-auth';
import {
  buildSignInPath,
  firstParamValue,
  resolveSignedInRedirect,
  type SearchParamValue,
} from './auth-redirect';

type SessionUser = NonNullable<Session['user']>;

export type ProtectedRouteDecision =
  | { type: 'allow'; user: SessionUser }
  | { type: 'redirect'; location: string };

export function resolveProtectedRoute(
  session: Session | null,
  callbackPath: string,
): ProtectedRouteDecision {
  if (session?.user) {
    return { type: 'allow', user: session.user };
  }

  return { type: 'redirect', location: buildSignInPath(callbackPath) };
}

export type SignInPageDecision =
  | { type: 'redirect'; location: string }
  | { type: 'show-missing-config' };

interface SignInPageDecisionInput {
  callbackParam: SearchParamValue;
  isAuthenticated: boolean;
  hasGoogleOAuthConfig: boolean;
}

export function getSignInPageDecision({
  callbackParam,
  isAuthenticated,
  hasGoogleOAuthConfig,
}: SignInPageDecisionInput): SignInPageDecision {
  const callbackUrl = resolveSignedInRedirect(firstParamValue(callbackParam));

  if (isAuthenticated) {
    return { type: 'redirect', location: callbackUrl };
  }

  if (hasGoogleOAuthConfig) {
    return {
      type: 'redirect',
      location: `/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    };
  }

  return { type: 'show-missing-config' };
}
