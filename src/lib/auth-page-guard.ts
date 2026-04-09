import { redirect } from 'next/navigation';
import type { ActiveSessionContext } from './auth-guard';
import { AuthGuardError, requireActiveSession } from './auth-guard';
import { buildSignInPath } from './auth-redirect';

export function redirectForPageAuthError(error: unknown, callbackPath: string): never {
  if (error instanceof AuthGuardError) {
    if (error.code === 'UNAUTHENTICATED') {
      redirect(buildSignInPath(callbackPath));
    }

    if (error.code === 'BLOCKED') {
      redirect('/auth/signin?error=blocked');
    }

    redirect(buildSignInPath(callbackPath));
  }

  throw error;
}

export async function requireActivePageSession(callbackPath: string): Promise<ActiveSessionContext> {
  try {
    return await requireActiveSession();
  } catch (error) {
    redirectForPageAuthError(error, callbackPath);
  }
}
