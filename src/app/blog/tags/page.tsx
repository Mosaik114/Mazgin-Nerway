import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTagsWithCount } from '@/lib/posts';
import { getCspNonce } from '@/lib/csp';
import { SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl, toJsonLd } from '@/lib/seo';
import styles from './tags.module.css';

const TAGS_TITLE = 'Schlagwörter';
const TAGS_DESCRIPTION = 'Alle Themen und Schlagwörter aus dem Blog.';

export const metadata: Metadata = {
  title: TAGS_TITLE,
  description: TAGS_DESCRIPTION,
  alternates: {
    canonical: '/blog/tags',
    languages: {
      [SITE_LANGUAGE]: '/blog/tags',
      'x-default': '/blog/tags',
    },
  },
  openGraph: {
    title: `${TAGS_TITLE} | ${SITE_NAME}`,
    description: TAGS_DESCRIPTION,
    url: '/blog/tags',
    type: 'website',
  },
};

export default async function BlogTagsPage() {
  const nonce = await getCspNonce();
  const tags = getAllTagsWithCount();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: toAbsoluteUrl('/blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: TAGS_TITLE,
        item: toAbsoluteUrl('/blog/tags'),
      },
    ],
  };

  return (
    <section className={styles.page}>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="container">
        <Link href="/blog" className={styles.back}>← Zurück zum Blog</Link>

        <header className={styles.header}>
          <p className={styles.tag}>Schlagwörter</p>
          <h1 className={styles.title}>Themen entdecken</h1>
          <p className={styles.subtitle}>
            {tags.length} Schlagwörter helfen dir, passende Beiträge schneller zu finden.
          </p>
        </header>

        <div className={styles.grid}>
          {tags.map((tag) => (
            <Link key={tag.slug} href={`/blog/tags/${tag.slug}`} className={styles.tagCard}>
              <span className={styles.tagName}>{tag.name}</span>
              <span className={styles.tagCount}>{tag.count} Beiträge</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
