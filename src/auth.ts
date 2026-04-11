import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { prisma } from '@/lib/prisma';
import { normalizeEmail, parseAdminEmails, resolveRoleForEmail } from '@/lib/auth-policy';
import { readEnv } from '@/lib/utils';
import authConfig from '@/auth.config';

const authSecret = readEnv('AUTH_SECRET', 'NEXTAUTH_SECRET');

const missingAuthConfig: string[] = [];

if (!authSecret) {
  missingAuthConfig.push('AUTH_SECRET (or NEXTAUTH_SECRET)');
}

if (!process.env.DATABASE_URL) {
  missingAuthConfig.push('DATABASE_URL');
}

if (missingAuthConfig.length > 0) {
  const message = `[auth] Missing required environment variables: ${missingAuthConfig.join(', ')}`;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  }

  console.error(message);
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

      const normalizedEmail = normalizeEmail(user.email);
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
        const policyRole = resolveRoleForEmail(user.email);

        session.user.id = user.id;
        session.user.role = policyRole;
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

      const normalizedEmail = normalizeEmail(user.email);
      const adminEmails = parseAdminEmails();
      const roleByPolicy = resolveRoleForEmail(normalizedEmail, adminEmails);

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
            role: roleByPolicy,
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
