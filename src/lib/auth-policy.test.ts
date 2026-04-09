import { Role } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { isAdminEmail, normalizeEmail, parseAdminEmails, resolveRoleForEmail } from './auth-policy';

describe('auth policy helpers', () => {
  it('normalizes emails before checks', () => {
    expect(normalizeEmail('  USER@Example.com  ')).toBe('user@example.com');
  });

  it('parses ADMIN_EMAILS into a stable set', () => {
    const set = parseAdminEmails('admin@example.com, team@example.com , ,ADMIN@example.com');
    expect(set.has('admin@example.com')).toBe(true);
    expect(set.has('team@example.com')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('resolves role strictly from allow-list', () => {
    const admins = parseAdminEmails('admin@example.com');

    expect(isAdminEmail('admin@example.com', admins)).toBe(true);
    expect(isAdminEmail('user@example.com', admins)).toBe(false);
    expect(resolveRoleForEmail('admin@example.com', admins)).toBe(Role.ADMIN);
    expect(resolveRoleForEmail('user@example.com', admins)).toBe(Role.USER);
  });
});
