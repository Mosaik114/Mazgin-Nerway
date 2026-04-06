import { getAllPosts, getAllTagsWithCount } from '@/lib/posts';
import { SITE_URL } from '@/lib/config';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
  images?: string[];
}

interface StaticPageConfig {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified?: string;
  images?: string[];
}

const STATIC_PAGES: StaticPageConfig[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1, images: ['/images/og-home.jpg'] },
  {
    path: '/about',
    changeFrequency: 'monthly',
    priority: 0.7,
    images: ['/images/mazgin-rechts.png'],
  },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.55 },
];

const HUB_PAGES: StaticPageConfig[] = [
  { path: '/blog', changeFrequency: 'weekly', priority: 0.92 },
  { path: '/blog/tags', changeFrequency: 'weekly', priority: 0.76 },
  { path: '/blog/archiv', changeFrequency: 'weekly', priority: 0.72 },
  { path: '/feed.xml', changeFrequency: 'daily', priority: 0.4 },
];

function toAbsoluteUrl(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateOrFallback(value: string | undefined, fallback: Date): Date {
  return parseDate(value) ?? fallback;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderEntry(entry: SitemapEntry): string {
  const imagesTags = (entry.images ?? [])
    .map(
      (img) =>
        `    <image:image>\n      <image:loc>${escapeXml(img)}</image:loc>\n    </image:image>`,
    )
    .join('\n');

  return [
    '  <url>',
    `    <loc>${escapeXml(entry.url)}</loc>`,
    entry.lastModified
      ? `    <lastmod>${entry.lastModified.toISOString()}</lastmod>`
      : null,
    `    <changefreq>${entry.changeFrequency}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    imagesTags || null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export function GET() {
  const posts = getAllPosts();
  const tags = getAllTagsWithCount();
  const now = new Date();
  const latestPostDate = posts[0] ? parseDateOrFallback(posts[0].date, now) : now;

  const entries: SitemapEntry[] = [];

  for (const page of STATIC_PAGES) {
    const lastModified = parseDate(page.lastModified) ?? undefined;
    entries.push({
      url: toAbsoluteUrl(page.path),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      images: page.images?.map((img) => toAbsoluteUrl(img)),
    });
  }

  for (const page of HUB_PAGES) {
    entries.push({
      url: toAbsoluteUrl(page.path),
      lastModified: latestPostDate,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  for (const tag of tags) {
    entries.push({
      url: `${SITE_URL}/blog/tags/${tag.slug}`,
      lastModified: latestPostDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  for (const post of posts) {
    const images: string[] = [];
    if (post.coverImage) {
      images.push(toAbsoluteUrl(post.coverImage));
    }

    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: parseDateOrFallback(post.updatedAt ?? post.date, latestPostDate),
      changeFrequency: 'monthly',
      priority: 0.82,
      images: images.length > 0 ? images : undefined,
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map(renderEntry),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
