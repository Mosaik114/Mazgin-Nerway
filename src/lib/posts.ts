import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'src/content/posts');

export interface Post {
  slug: string;
  title: string;
  seoTitle?: string;
  date: string;
  updatedAt?: string;
  excerpt: string;
  seoDescription?: string;
  category?: string;
  tags: string[];
  coverImage?: string;
  coverImageAlt?: string;
  canonicalUrl?: string;
  featured?: boolean;
  readingTime: number;
  content: string;
}

interface Frontmatter {
  title?: string;
  seoTitle?: string;
  date?: string;
  updatedAt?: string;
  slug?: string;
  excerpt?: string;
  seoDescription?: string;
  category?: string;
  tags?: unknown;
  coverImage?: string;
  coverImageAlt?: string;
  canonicalUrl?: string;
  featured?: boolean;
  published?: boolean;
}

export interface TagInfo {
  name: string;
  slug: string;
  count: number;
}

export interface ArchiveGroup {
  year: string;
  posts: Post[];
}

function calcReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00DF/g, 'ss')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeTagLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const unique = new Map<string, string>();

  for (const entry of value) {
    if (typeof entry !== 'string') continue;

    const label = normalizeTagLabel(entry);
    const slug = normalizeSlug(label);
    if (!slug || unique.has(slug)) continue;

    unique.set(slug, label);
  }

  return Array.from(unique.values());
}

function parsePost(filename: string, content: string, data: Frontmatter): Post {
  const filenameSlug = filename.replace('.md', '');
  const slug = normalizeSlug(data.slug ?? filenameSlug);
  const title = data.title?.trim() || slug;
  const excerpt = data.excerpt?.trim() || `${content.slice(0, 160).replace(/\n/g, ' ')}...`;

  return {
    slug,
    title,
    seoTitle: data.seoTitle?.trim(),
    date: data.date?.trim() ?? '',
    updatedAt: data.updatedAt?.trim(),
    excerpt,
    seoDescription: data.seoDescription?.trim(),
    category: data.category?.trim(),
    tags: parseTags(data.tags),
    coverImage: data.coverImage?.trim(),
    coverImageAlt: data.coverImageAlt?.trim(),
    canonicalUrl: data.canonicalUrl?.trim(),
    featured: data.featured ?? false,
    readingTime: calcReadingTime(content),
    content,
  };
}

function getComparableTimestamp(post: Post): number {
  const source = post.updatedAt || post.date;
  const timestamp = Date.parse(source);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

let cachedPosts: Post[] | null = null;

export function getAllPosts(): Post[] {
  const useCache = process.env.NODE_ENV === 'production';
  if (useCache && cachedPosts) return cachedPosts;

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  const posts = files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
      const { data, content } = matter(raw);
      if ((data as Frontmatter).published === false) return null;
      return parsePost(filename, content, data as Frontmatter);
    })
    .filter((p): p is Post => p !== null);

  const sorted = posts.sort((a, b) => {
    const byDate = getComparableTimestamp(b) - getComparableTimestamp(a);
    if (byDate !== 0) return byDate;
    return a.slug.localeCompare(b.slug, 'de-DE');
  });

  if (useCache) cachedPosts = sorted;

  return sorted;
}

export function getPostBySlug(slug: string): Post | null {
  const incoming = normalizeSlug(decodeURIComponent(slug));
  return getAllPosts().find((p) => normalizeSlug(p.slug) === incoming) ?? null;
}

export function getTagSlug(tag: string): string {
  return normalizeSlug(tag);
}

export function getAllTagsWithCount(): TagInfo[] {
  const counts = new Map<string, TagInfo>();

  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      const slug = getTagSlug(tag);
      const entry = counts.get(slug);
      if (entry) {
        entry.count += 1;
      } else {
        counts.set(slug, {
          name: tag,
          slug,
          count: 1,
        });
      }
    }
  }

  return Array.from(counts.values()).sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name, 'de-DE');
  });
}

export function getTagInfoBySlug(tagSlug: string): TagInfo | null {
  const incoming = normalizeSlug(decodeURIComponent(tagSlug));
  return getAllTagsWithCount().find((tag) => tag.slug === incoming) ?? null;
}

export function getPostsByTagSlug(tagSlug: string): Post[] {
  const incoming = normalizeSlug(decodeURIComponent(tagSlug));

  return getAllPosts().filter((post) =>
    post.tags.some((tag) => normalizeSlug(tag) === incoming),
  );
}

export function getArchiveByYear(): ArchiveGroup[] {
  const groups = new Map<string, Post[]>();

  for (const post of getAllPosts()) {
    const yearMatch = post.date.match(/^\d{4}/);
    const year = yearMatch ? yearMatch[0] : 'Unbekannt';

    const posts = groups.get(year);
    if (posts) {
      posts.push(post);
    } else {
      groups.set(year, [post]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === 'Unbekannt') return 1;
      if (b === 'Unbekannt') return -1;
      return Number(b) - Number(a);
    })
    .map(([year, posts]) => ({
      year,
      posts,
    }));
}
