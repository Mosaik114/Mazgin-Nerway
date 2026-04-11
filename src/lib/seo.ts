import { SITE_URL, SOCIAL_LINKS } from '@/lib/config';

export const SITE_NAME = 'Mizgin Nerway';
export const SITE_DESCRIPTION = 'Essays, Gedanken und Reflexionen - irgendwo zwischen zwei Welten.';
export const SITE_LANGUAGE = 'de-DE';
export const SITE_PERSON_GENDER = 'Male';

export function toAbsoluteUrl(pathname = '/'): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function toIsoDateOrNull(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Reusable Person JSON-LD (used in layout.tsx and about/page.tsx). */
export function buildPersonJsonLd({ includeSameAs = false } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/about#person`,
    name: SITE_NAME,
    alternateName: ['Nerway', 'Mizgin'],
    url: SITE_URL,
    image: `${SITE_URL}/images/mizgin-rechts.png`,
    jobTitle: 'Autor & Essayist',
    description:
      'Mizgin Nerway ist Autor und Essayist. Er schreibt auf Deutsch über Identität, Sprache und das Leben zwischen zwei Kulturen.',
    gender: SITE_PERSON_GENDER,
    ...(includeSameAs
      ? { sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok, SOCIAL_LINKS.youtube] }
      : {}),
    knowsLanguage: ['de', 'de-DE'],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/about`,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Builds a BreadcrumbList JSON-LD from a list of items (Startseite is prepended automatically). */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: toAbsoluteUrl('/') },
      ...items.map((item, index) => ({
        '@type': 'ListItem' as const,
        position: index + 2,
        name: item.name,
        item: toAbsoluteUrl(item.path),
      })),
    ],
  };
}
