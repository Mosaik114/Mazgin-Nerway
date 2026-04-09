import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './signin.module.css';

type SearchParamValue = string | string[] | undefined;
type SignInSearchParams = Record<string, SearchParamValue>;

interface SignInPageProps {
  searchParams?: Promise<SignInSearchParams>;
}

function firstParamValue(value: SearchParamValue): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function getSafeCallbackUrl(rawCallbackUrl: string): string {
  const callbackUrl = rawCallbackUrl.trim();
  if (!callbackUrl) {
    return '/';
  }

  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }

  return '/';
}

function hasGoogleOAuthConfig(): boolean {
  const clientId = (process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? '').trim();
  const clientSecret = (process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? '').trim();
  return Boolean(clientId && clientSecret);
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl = getSafeCallbackUrl(firstParamValue(resolvedSearchParams.callbackUrl));

  if (hasGoogleOAuthConfig()) {
    redirect(`/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Anmeldung</p>
        <h1 className={styles.title}>Google Login ist noch nicht konfiguriert</h1>
        <p className={styles.text}>
          Der OAuth-Flow wurde gestoppt, weil in der aktuellen Umgebung eine notwendige Google
          Konfiguration fehlt.
        </p>
        <div className={styles.variables}>
          <code>AUTH_GOOGLE_ID</code>
          <code>AUTH_GOOGLE_SECRET</code>
          <code>AUTH_SECRET</code>
        </div>
        <p className={styles.text}>
          Setze diese Variablen lokal in <code>.env.local</code> oder im Deployment (z. B.
          Vercel) und starte den Server neu.
        </p>
        <Link href="/" className={styles.link}>
          Zurueck zur Startseite
        </Link>
      </div>
    </section>
  );
}
