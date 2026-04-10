export const CATEGORIES = [
  'Pers\u00F6nliches',
  'Schreiben',
  'Gedanken',
  'Glaube',
  'Streit',
  'Kindheit',
  'Kultur',
  'Literatur',
  'Identit\u00E4t',
  'Liebe',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Pers\u00F6nliches': '#c9a84c',
  Schreiben: '#7a9e7e',
  Gedanken: '#c9a84c',
  Glaube: '#4ca96b',
  Streit: '#c94c4c',
  Kindheit: '#89CFF0',
  Kultur: '#9e7a8e',
  Literatur: '#9e8e7a',
  'Identit\u00E4t': '#8d7ac9',
  'Liebe': '#e05a8a',
};
