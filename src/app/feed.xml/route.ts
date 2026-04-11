import { remark } from 'remark';
import html from 'remark-html';
import { getAllEssays } from '@/lib/essays';
import { SITE_URL } from '@/lib/config';
import { SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl } from '@/lib/seo';
import { escapeXml, parseDateOrFallback } from '@/lib/utils';

function toCdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

async function toHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}

export async function GET() {
  const essays = getAllEssays();
  const now = new Date();
  const latestPostDate = essays[0]
    ? parseDateOrFallback(essays[0].updatedAt ?? essays[0].date, now)
    : now;

  const items = await Promise.all(
    essays.map(async (essay) => {
      const articleUrl = toAbsoluteUrl(`/essays/${essay.slug}`);
      const pubDate = parseDateOrFallback(essay.date, latestPostDate).toUTCString();
      const htmlContent = await toHtml(essay.content);
      const categories = [essay.category, ...essay.tags].filter(
        (value): value is string => Boolean(value),
      );
      const categoryItems = categories
        .map((category) => `<category>${escapeXml(category)}</category>`)
        .join('');

      return `
    <item>
      <title>${escapeXml(essay.seoTitle ?? essay.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${toCdata(essay.seoDescription ?? essay.excerpt)}</description>
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
