import Script from 'next/script';

/**
 * Analytics component — supports Umami (privacy-friendly, no cookie banner needed).
 *
 * Set these environment variables:
 *   NEXT_PUBLIC_UMAMI_URL      — e.g. "https://analytics.mazginnerway.de"
 *   NEXT_PUBLIC_UMAMI_WEBSITE_ID — your Umami website ID
 *
 * If the env vars are missing, nothing is rendered.
 */
export default function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_URL;
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!src || !id) return null;

  return (
    <Script
      src={`${src}/script.js`}
      data-website-id={id}
      strategy="afterInteractive"
    />
  );
}
