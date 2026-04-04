import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

const shouldAllowIndexing =
  process.env.NODE_ENV === 'production'
  && (!process.env.VERCEL || process.env.VERCEL_ENV === 'production');

export default function robots(): MetadataRoute.Robots {
  if (!shouldAllowIndexing) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
