export const SITE_URL = 'https://www.nerway.de';
export const LOCALE = 'de-DE';
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/mizgin_nerway/',
  tiktok: 'https://www.tiktok.com/@mizgin_nerway',
  youtube: 'https://www.youtube.com/@mizgin_nerway',
} as const;

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
