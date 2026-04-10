import { describe, expect, it } from 'vitest';
import {
  getAllEssays,
  getAllTagsWithCount,
  getArchiveByYear,
  getEssayBySlug,
  getEssaysByTagSlug,
  getTagInfoBySlug,
  normalizeSlug,
} from './essays';

describe('essays helpers', () => {
  it('normalizes slugs including umlauts and ß', () => {
    expect(normalizeSlug(' Straße & Bühne ')).toBe('strasse-buhne');
    expect(normalizeSlug('  Mehr   Worte  ')).toBe('mehr-worte');
  });

  it('loads published essays and resolves essays by slug', () => {
    const essays = getAllEssays();
    expect(essays.length).toBeGreaterThan(0);

    const first = essays[0];
    expect(first.title.length).toBeGreaterThan(0);
    expect(first.tags.length).toBeGreaterThan(0);

    const resolved = getEssayBySlug(first.slug);
    expect(resolved?.slug).toBe(first.slug);
  });

  it('builds tag indexes consistently', () => {
    const tags = getAllTagsWithCount();
    expect(tags.length).toBeGreaterThan(0);

    const uniqueSlugs = new Set(tags.map((tag) => tag.slug));
    expect(uniqueSlugs.size).toBe(tags.length);
    expect(tags.every((tag) => tag.count >= 1)).toBe(true);

    const firstTag = tags[0];
    const tagInfo = getTagInfoBySlug(firstTag.slug);
    expect(tagInfo?.slug).toBe(firstTag.slug);

    const taggedEssays = getEssaysByTagSlug(firstTag.slug);
    expect(taggedEssays.length).toBeGreaterThan(0);
  });

  it('groups archive entries without losing essays', () => {
    const essays = getAllEssays();
    const archive = getArchiveByYear();

    const totalInArchive = archive.reduce((sum, group) => sum + group.essays.length, 0);
    expect(totalInArchive).toBe(essays.length);
  });
});

