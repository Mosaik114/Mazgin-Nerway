import type { Role } from '@prisma/client';
import { isAdminEmail } from './auth-policy';

export const FRESH_LOGIN_WINDOW_MS = 10 * 60 * 1000;

export type AuthGuardErrorCode =
  | 'UNAUTHENTICATED'
  | 'BLOCKED'
  | 'FORBIDDEN'
  | 'STALE_AUTH';

const AUTH_ERROR_MAP: Record<AuthGuardErrorCode, { status: number; message: string }> = {
  UNAUTHENTICATED: { status: 401, message: 'Nicht eingeloggt' },
  BLOCKED: { status: 403, message: 'Konto ist gesperrt' },
  FORBIDDEN: { status: 403, message: 'Nicht autorisiert' },
  STALE_AUTH: { status: 401, message: 'Bitte melde dich erneut an' },
};

export class AuthGuardError extends Error {
  code: AuthGuardErrorCode;
  status: number;

  constructor(code: AuthGuardErrorCode) {
    const details = AUTH_ERROR_MAP[code];
    super(details.message);
    this.name = 'AuthGuardError';
    this.code = code;
    this.status = details.status;
  }
}

export interface GuardUserRecord {
  id: string;
  email: string | null;
  role: Role;
  isBlocked: boolean;
  lastLoginAt: Date | null;
}

export type AccessResolution =
  | {
      ok: true;
      user: GuardUserRecord;
      isAdminByPolicy: boolean;
    }
  | {
      ok: false;
      code: AuthGuardErrorCode;
    };

interface ResolveAccessInput {
  sessionUserId?: string | null;
  user: GuardUserRecord | null;
  requireAdmin?: boolean;
}

export function resolveAccess({
  sessionUserId,
  user,
  requireAdmin = false,
}: ResolveAccessInput): AccessResolution {
  if (!sessionUserId || !user) {
    return { ok: false, code: 'UNAUTHENTICATED' };
  }

  if (user.isBlocked) {
    return { ok: false, code: 'BLOCKED' };
  }

  const isAdminByPolicy = isAdminEmail(user.email);
  if (requireAdmin && !isAdminByPolicy) {
    return { ok: false, code: 'FORBIDDEN' };
  }

  return {
    ok: true,
    user,
    isAdminByPolicy,
  };
}

export function isFreshLogin(
  lastLoginAt: Date | null,
  now: Date = new Date(),
  windowMs: number = FRESH_LOGIN_WINDOW_MS,
): boolean {
  if (!lastLoginAt) {
    return false;
  }

  return now.getTime() - lastLoginAt.getTime() <= windowMs;
}

export function assertFreshLogin(
  lastLoginAt: Date | null,
  now: Date = new Date(),
  windowMs: number = FRESH_LOGIN_WINDOW_MS,
) {
  if (!isFreshLogin(lastLoginAt, now, windowMs)) {
    throw new AuthGuardError('STALE_AUTH');
  }
}
