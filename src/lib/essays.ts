import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDir = path.join(process.cwd(), 'src/content/posts');

export interface TocHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export interface Essay {
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
  contentHtml: string;
  tocHeadings: TocHeading[];
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
  essays: Essay[];
}

function calcReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));
}

function normalizeHeadingId(value: string): string {
  return normalizeSlug(value) || 'abschnitt';
}

function dedupeHeadingId(base: string, counters: Map<string, number>): string {
  const count = counters.get(base) ?? 0;
  counters.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function extractTocHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const counters = new Map<string, number>();
  let inCodeBlock = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(trimmed);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2]
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim();
    if (!text) continue;

    const baseId = normalizeHeadingId(text);
    const id = dedupeHeadingId(baseId, counters);
    headings.push({ id, level, text });
  }

  return headings;
}

function attachHeadingIdsToHtml(contentHtml: string, tocHeadings: TocHeading[]): string {
  const h2 = tocHeadings.filter((h) => h.level === 2);
  const h3 = tocHeadings.filter((h) => h.level === 3);
  let h2Index = 0;
  let h3Index = 0;

  return contentHtml
    .replace(/<h2>([\s\S]*?)<\/h2>/g, (_full, inner) => {
      const heading = h2[h2Index++];
      if (!heading) return `<h2>${inner}</h2>`;
      return `<h2 id="${heading.id}">${inner}</h2>`;
    })
    .replace(/<h3>([\s\S]*?)<\/h3>/g, (_full, inner) => {
      const heading = h3[h3Index++];
      if (!heading) return `<h3>${inner}</h3>`;
      return `<h3 id="${heading.id}">${inner}</h3>`;
    });
}

function buildContentHtml(markdown: string, tocHeadings: TocHeading[]): string {
  const processed = remark().use(html).processSync(markdown);
  return attachHeadingIdsToHtml(processed.toString(), tocHeadings);
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

function parseEssay(filename: string, content: string, data: Frontmatter): Essay {
  const filenameSlug = filename.replace('.md', '');
  const slug = normalizeSlug(data.slug ?? filenameSlug);
  const title = data.title?.trim() || slug;
  const excerpt = data.excerpt?.trim() || `${content.slice(0, 160).replace(/\n/g, ' ')}...`;
  const tocHeadings = extractTocHeadings(content);
  const contentHtml = buildContentHtml(content, tocHeadings);

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
    contentHtml,
    tocHeadings,
  };
}

export function getComparableTimestamp(date: string, updatedAt?: string): number {
  const source = updatedAt || date;
  const timestamp = Date.parse(source);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

let cachedEssays: Essay[] | null = null;

export function getAllEssays(): Essay[] {
  if (cachedEssays) return cachedEssays;

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  const essays = files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
      const { data, content } = matter(raw);
      if ((data as Frontmatter).published === false) return null;
      return parseEssay(filename, content, data as Frontmatter);
    })
    .filter((e): e is Essay => e !== null);

  const sorted = essays.sort((a, b) => {
    const byDate = getComparableTimestamp(b.date, b.updatedAt) - getComparableTimestamp(a.date, a.updatedAt);
    if (byDate !== 0) return byDate;
    return a.slug.localeCompare(b.slug, 'de-DE');
  });

  cachedEssays = sorted;

  return sorted;
}

export function getEssayBySlug(slug: string): Essay | null {
  const incoming = normalizeSlug(decodeURIComponent(slug));
  return getAllEssays().find((e) => normalizeSlug(e.slug) === incoming) ?? null;
}

export function getTagSlug(tag: string): string {
  return normalizeSlug(tag);
}

export function getAllTagsWithCount(): TagInfo[] {
  const counts = new Map<string, TagInfo>();

  for (const essay of getAllEssays()) {
    for (const tag of essay.tags) {
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

export function getEssaysByTagSlug(tagSlug: string): Essay[] {
  const incoming = normalizeSlug(decodeURIComponent(tagSlug));

  return getAllEssays().filter((essay) =>
    essay.tags.some((tag) => normalizeSlug(tag) === incoming),
  );
}

export function getArchiveByYear(): ArchiveGroup[] {
  const groups = new Map<string, Essay[]>();

  for (const essay of getAllEssays()) {
    const yearMatch = essay.date.match(/^\d{4}/);
    const year = yearMatch ? yearMatch[0] : 'Unbekannt';

    const entries = groups.get(year);
    if (entries) {
      entries.push(essay);
    } else {
      groups.set(year, [essay]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === 'Unbekannt') return 1;
      if (b === 'Unbekannt') return -1;
      return Number(b) - Number(a);
    })
    .map(([year, essays]) => ({
      year,
      essays,
    }));
}

function getSharedTagCount(currentTags: string[], candidateTags: string[]): number {
  if (currentTags.length === 0 || candidateTags.length === 0) return 0;

  const current = new Set(currentTags.map((tag) => getTagSlug(tag)));
  return candidateTags.reduce((count, tag) => {
    return current.has(getTagSlug(tag)) ? count + 1 : count;
  }, 0);
}

export interface EssayNavigation {
  prevPost: Essay | null;
  nextPost: Essay | null;
  related: Essay[];
}

/** Returns prev/next posts and up to `maxRelated` related essays for a given post. */
export function getEssayNavigation(post: Essay, maxRelated = 2): EssayNavigation {
  const orderedPosts = getAllEssays();
  const postIndex = orderedPosts.findIndex((candidate) => candidate.slug === post.slug);

  const prevPost = postIndex >= 0 && postIndex < orderedPosts.length - 1
    ? orderedPosts[postIndex + 1]
    : null;
  const nextPost = postIndex > 0 ? orderedPosts[postIndex - 1] : null;

  const otherPosts = orderedPosts.filter((candidate) => candidate.slug !== post.slug);

  const relatedByTags = otherPosts
    .map((candidate) => ({
      candidate,
      score: getSharedTagCount(post.tags, candidate.tags),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getComparableTimestamp(b.candidate.date, b.candidate.updatedAt)
        - getComparableTimestamp(a.candidate.date, a.candidate.updatedAt);
    })
    .map((item) => item.candidate);

  const related = [...relatedByTags];

  if (related.length < maxRelated && post.category) {
    const fallback = otherPosts
      .filter((candidate) => candidate.category === post.category)
      .filter((candidate) => !related.some((item) => item.slug === candidate.slug))
      .sort((a, b) => getComparableTimestamp(b.date, b.updatedAt) - getComparableTimestamp(a.date, a.updatedAt));

    related.push(...fallback);
  }

  return { prevPost, nextPost, related: related.slice(0, maxRelated) };
}
