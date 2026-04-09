import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

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

const googleClientId = readEnv('AUTH_GOOGLE_ID', 'GOOGLE_CLIENT_ID');
const googleClientSecret = readEnv('AUTH_GOOGLE_SECRET', 'GOOGLE_CLIENT_SECRET');
const googleOAuthConfigured = Boolean(googleClientId && googleClientSecret);

const providers: NextAuthConfig['providers'] = googleOAuthConfigured
  ? [
      Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      }),
    ]
  : [];

export default {
  providers,
  trustHost: true,
} satisfies NextAuthConfig;
