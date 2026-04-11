export const SITE_URL = 'https://www.nerway.de';
export const LOCALE = 'de-DE';
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/mazgin_nerway/',
  tiktok: 'https://www.tiktok.com/@mazgin_nerway',
  youtube: 'https://www.youtube.com/@mazgin_nerway',
} as const;

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
