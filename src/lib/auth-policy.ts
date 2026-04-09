import { Role } from '@prisma/client';

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function parseAdminEmails(rawValue: string | undefined = process.env.ADMIN_EMAILS): Set<string> {
  const raw = rawValue ?? '';

  return new Set(
    raw
      .split(',')
      .map((email) => normalizeEmail(email))
      .filter(Boolean),
  );
}

export function isAdminEmail(
  email: string | null | undefined,
  adminEmails: ReadonlySet<string> = parseAdminEmails(),
): boolean {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return false;
  }

  return adminEmails.has(normalizedEmail);
}

export function resolveRoleForEmail(
  email: string | null | undefined,
  adminEmails: ReadonlySet<string> = parseAdminEmails(),
): Role {
  return isAdminEmail(email, adminEmails) ? Role.ADMIN : Role.USER;
}
