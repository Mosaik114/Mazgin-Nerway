import { SITE_URL } from '@/lib/config';

export const SITE_NAME = 'Mazgin Nerway';
export const SITE_DESCRIPTION = 'Gedanken, Geschichten und Reflexionen - irgendwo zwischen zwei Welten.';
export const SITE_LANGUAGE = 'de-DE';
export const SITE_PERSON_GENDER = 'male';

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
