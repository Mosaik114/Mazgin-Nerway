export const CATEGORIES = [
  'Persönliches',
  'Schreiben',
  'Gedanken',
  'Kultur',
  'Literatur',
  'Identität',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Persönliches: '#c9a84c',
  Schreiben:    '#7a9e7e',
  Gedanken:     '#7a8e9e',
  Kultur:       '#9e7a8e',
  Literatur:    '#9e8e7a',
  Identität:    '#8d7ac9',
};
