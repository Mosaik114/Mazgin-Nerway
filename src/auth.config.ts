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
const authUrl = readEnv('AUTH_URL', 'NEXTAUTH_URL');
const hasVercelRuntimeHost = Boolean(process.env.VERCEL_URL);
const trustHost =
  process.env.NODE_ENV === 'production'
    ? Boolean(authUrl) || hasVercelRuntimeHost
    : true;

if (process.env.NODE_ENV === 'production' && !authUrl && !hasVercelRuntimeHost) {
  console.error(
    '[auth] AUTH_URL (or NEXTAUTH_URL) is missing in production and no VERCEL_URL fallback is available. trustHost is disabled.',
  );
}

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
  trustHost,
} satisfies NextAuthConfig;
