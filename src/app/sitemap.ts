import type { MetadataRoute } from 'next';
import { getAllPosts, getAllTagsWithCount } from '@/lib/posts';
import { SITE_URL } from '@/lib/config';

function parseDateOrFallback(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTagsWithCount();
  const now = new Date();
  const latestPostDate = posts[0] ? parseDateOrFallback(posts[0].date, now) : now;

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: parseDateOrFallback(post.updatedAt ?? post.date, latestPostDate),
    changeFrequency: 'monthly',
    priority: 0.82,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/blog/tags/${tag.slug}`,
    lastModified: latestPostDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: latestPostDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog/tags`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.76,
    },
    {
      url: `${SITE_URL}/blog/archiv`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.72,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: latestPostDate,
      changeFrequency: 'yearly',
      priority: 0.55,
    },
    {
      url: `${SITE_URL}/feed.xml`,
      lastModified: latestPostDate,
      changeFrequency: 'daily',
      priority: 0.4,
    },
    ...tagEntries,
    ...postEntries,
  ];
}
