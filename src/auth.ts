import { PrismaAdapter } from '@auth/prisma-adapter';
import { Role } from '@prisma/client';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

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
const googleClientId = readEnv('AUTH_GOOGLE_ID', 'GOOGLE_CLIENT_ID');
const googleClientSecret = readEnv('AUTH_GOOGLE_SECRET', 'GOOGLE_CLIENT_SECRET');
const googleOAuthConfigured = Boolean(googleClientId && googleClientSecret);

const missingAuthConfig: string[] = [];

if (!authSecret) {
  missingAuthConfig.push('AUTH_SECRET (or NEXTAUTH_SECRET)');
}

if (!googleClientId) {
  missingAuthConfig.push('AUTH_GOOGLE_ID (or GOOGLE_CLIENT_ID)');
}

if (!googleClientSecret) {
  missingAuthConfig.push('AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_SECRET)');
}

if (!process.env.DATABASE_URL) {
  missingAuthConfig.push('DATABASE_URL');
}

if (missingAuthConfig.length > 0) {
  console.error(`[auth] Missing required environment variables: ${missingAuthConfig.join(', ')}`);
}

const providers = googleOAuthConfigured
  ? [
      Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: authSecret || undefined,
  trustHost: true,
  session: {
    strategy: 'database',
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const normalizedEmail = user.email.trim().toLowerCase();
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
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? Role.USER;
        session.user.isBlocked = user.isBlocked ?? false;
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
    },
  },
});
