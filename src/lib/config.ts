export const SITE_URL = 'https://www.nerway.de';
export const LOCALE = 'de-DE';

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
