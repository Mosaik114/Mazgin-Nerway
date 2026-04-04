import { remark } from 'remark';
import html from 'remark-html';
import { getAllPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/config';
import { SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl } from '@/lib/seo';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toCdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function parseDateOrFallback(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function toHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}

export async function GET() {
  const posts = getAllPosts();
  const now = new Date();
  const latestPostDate = posts[0]
    ? parseDateOrFallback(posts[0].updatedAt ?? posts[0].date, now)
    : now;

  const items = await Promise.all(
    posts.map(async (post) => {
      const articleUrl = toAbsoluteUrl(`/blog/${post.slug}`);
      const pubDate = parseDateOrFallback(post.date, latestPostDate).toUTCString();
      const htmlContent = await toHtml(post.content);
      const categories = [post.category, ...post.tags].filter(
        (value): value is string => Boolean(value),
      );
      const categoryItems = categories
        .map((category) => `<category>${escapeXml(category)}</category>`)
        .join('');

      return `
    <item>
      <title>${escapeXml(post.seoTitle ?? post.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${toCdata(post.seoDescription ?? post.excerpt)}</description>
      ${categoryItems}
      <content:encoded>${toCdata(htmlContent)}</content:encoded>
    </item>`;
    }),
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
    <generator>Next.js</generator>
    <ttl>60</ttl>
    ${items.join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
