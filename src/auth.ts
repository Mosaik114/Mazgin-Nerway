import { PrismaAdapter } from '@auth/prisma-adapter';
import { Role } from '@prisma/client';
import NextAuth from 'next-auth';
import { prisma } from '@/lib/prisma';
import authConfig from '@/auth.config';

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return '';
}

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const authSecret = readEnv('AUTH_SECRET', 'NEXTAUTH_SECRET');

const missingAuthConfig: string[] = [];

if (!authSecret) {
  missingAuthConfig.push('AUTH_SECRET (or NEXTAUTH_SECRET)');
}

if (!process.env.DATABASE_URL) {
  missingAuthConfig.push('DATABASE_URL');
}

if (missingAuthConfig.length > 0) {
  console.error(`[auth] Missing required environment variables: ${missingAuthConfig.join(', ')}`);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: authSecret || undefined,
  session: {
    strategy: 'database',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const normalizedEmail = user.email.trim().toLowerCase();
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: normalizedEmail,
              mode: 'insensitive',
            },
          },
        });

        if (!dbUser) {
          return true;
        }

        if (dbUser.isBlocked) {
          return false;
        }

        return true;
      } catch (error) {
        console.error('[auth] Failed to validate sign-in request.', {
          email: normalizedEmail,
          error,
        });
        return false;
      }
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? Role.USER;
        session.user.isBlocked = user.isBlocked ?? false;
        session.user.image = user.image ?? null;

        // displayName aus DB laden (nicht im user-Objekt des Adapters)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { displayName: true },
        });
        if (dbUser?.displayName) {
          session.user.name = dbUser.displayName;
        }
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.email) {
        return;
      }

      const normalizedEmail = user.email.trim().toLowerCase();
      try {
        await prisma.user.updateMany({
          where: {
            email: {
              equals: normalizedEmail,
              mode: 'insensitive',
            },
          },
          data: {
            email: normalizedEmail,
            lastLoginAt: new Date(),
            ...(adminEmails.has(normalizedEmail) ? { role: Role.ADMIN } : {}),
          },
        });
      } catch (error) {
        console.error('[auth] Failed to persist sign-in metadata.', {
          email: normalizedEmail,
          error,
        });
      }
    },
  },
});
