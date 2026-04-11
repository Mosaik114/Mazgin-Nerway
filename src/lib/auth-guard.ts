/**
 * Database-backed auth guards for API routes and server actions.
 * Re-exports pure logic from auth-guard-core for convenience.
 */
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  AuthGuardError,
  assertFreshLogin,
  FRESH_LOGIN_WINDOW_MS,
  isFreshLogin,
  resolveAccess,
  type AccessResolution,
  type AuthGuardErrorCode,
  type GuardUserRecord,
} from './auth-guard-core';

export {
  AuthGuardError,
  assertFreshLogin,
  FRESH_LOGIN_WINDOW_MS,
  isFreshLogin,
  resolveAccess,
  type AccessResolution,
  type AuthGuardErrorCode,
  type GuardUserRecord,
};

export interface ActiveSessionContext {
  sessionUser: NonNullable<Session['user']>;
  user: GuardUserRecord;
  isAdminByPolicy: boolean;
}

async function readUserRecord(userId: string): Promise<GuardUserRecord | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isBlocked: true,
      lastLoginAt: true,
    },
  });
}

async function requireAccess(requireAdmin = false): Promise<ActiveSessionContext> {
  const session = await auth();
  const sessionUser = session?.user;
  const sessionUserId = sessionUser?.id;
  const user = sessionUserId ? await readUserRecord(sessionUserId) : null;
  const resolution = resolveAccess({ sessionUserId, user, requireAdmin });

  if (!resolution.ok) {
    throw new AuthGuardError(resolution.code);
  }

  if (!sessionUser) {
    throw new AuthGuardError('UNAUTHENTICATED');
  }

  return {
    sessionUser,
    user: resolution.user,
    isAdminByPolicy: resolution.isAdminByPolicy,
  };
}

export async function requireActiveSession(): Promise<ActiveSessionContext> {
  return requireAccess(false);
}

export async function requireActiveAdminSession(): Promise<ActiveSessionContext> {
  return requireAccess(true);
}

export function toAuthErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof AuthGuardError)) {
    return null;
  }

  return NextResponse.json({ error: error.message }, { status: error.status });
}
