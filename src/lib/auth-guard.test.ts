import { Role } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import type { GuardUserRecord } from './auth-guard-core';
import { isFreshLogin, resolveAccess } from './auth-guard-core';

function user(overrides?: Partial<GuardUserRecord>): GuardUserRecord {
  return {
    id: 'user-1',
    email: 'user@example.com',
    role: Role.USER,
    isBlocked: false,
    lastLoginAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('resolveAccess', () => {
  it('returns unauthenticated when no session user id exists', () => {
    const result = resolveAccess({ sessionUserId: null, user: null });
    expect(result).toEqual({ ok: false, code: 'UNAUTHENTICATED' });
  });

  it('returns blocked when user is blocked', () => {
    const result = resolveAccess({
      sessionUserId: 'user-1',
      user: user({ isBlocked: true }),
    });
    expect(result).toEqual({ ok: false, code: 'BLOCKED' });
  });

  it('returns forbidden when admin is required but email is not allow-listed', () => {
    const result = resolveAccess({
      sessionUserId: 'user-1',
      user: user({ email: 'member@example.com' }),
      requireAdmin: true,
    });
    expect(result).toEqual({ ok: false, code: 'FORBIDDEN' });
  });

  it('allows admin when email is allow-listed', () => {
    const previous = process.env.ADMIN_EMAILS;
    try {
      process.env.ADMIN_EMAILS = 'admin@example.com';

      const result = resolveAccess({
        sessionUserId: 'user-1',
        user: user({ email: 'admin@example.com' }),
        requireAdmin: true,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.isAdminByPolicy).toBe(true);
      }
    } finally {
      process.env.ADMIN_EMAILS = previous;
    }
  });
});

describe('isFreshLogin', () => {
  it('detects stale sessions outside freshness window', () => {
    const now = new Date('2026-01-01T10:11:00.000Z');
    const lastLoginAt = new Date('2026-01-01T10:00:00.000Z');
    expect(isFreshLogin(lastLoginAt, now, 10 * 60 * 1000)).toBe(false);
  });

  it('accepts fresh sessions inside freshness window', () => {
    const now = new Date('2026-01-01T10:09:30.000Z');
    const lastLoginAt = new Date('2026-01-01T10:00:00.000Z');
    expect(isFreshLogin(lastLoginAt, now, 10 * 60 * 1000)).toBe(true);
  });
});
