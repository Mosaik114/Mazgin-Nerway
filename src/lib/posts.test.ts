import { describe, expect, it } from 'vitest';
import {
  getAllPosts,
  getAllTagsWithCount,
  getArchiveByYear,
  getPostBySlug,
  getPostsByTagSlug,
  getTagInfoBySlug,
  normalizeSlug,
} from './posts';

describe('posts helpers', () => {
  it('normalizes slugs including umlauts and ß', () => {
    expect(normalizeSlug(' Straße & Bühne ')).toBe('strasse-buhne');
    expect(normalizeSlug('  Mehr   Worte  ')).toBe('mehr-worte');
  });

  it('loads published posts and resolves posts by slug', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);

    const first = posts[0];
    expect(first.title.length).toBeGreaterThan(0);
    expect(first.tags.length).toBeGreaterThan(0);

    const resolved = getPostBySlug(first.slug);
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

    const taggedPosts = getPostsByTagSlug(firstTag.slug);
    expect(taggedPosts.length).toBeGreaterThan(0);
  });

  it('groups archive entries without losing posts', () => {
    const posts = getAllPosts();
    const archive = getArchiveByYear();

    const totalInArchive = archive.reduce((sum, group) => sum + group.posts.length, 0);
    expect(totalInArchive).toBe(posts.length);
  });
});

