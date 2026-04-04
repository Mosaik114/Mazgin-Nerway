import type { Metadata } from 'next';
import Link from 'next/link';
import { getArchiveByYear } from '@/lib/posts';
import { formatDate } from '@/lib/config';
import { SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl, toJsonLd } from '@/lib/seo';
import styles from './archiv.module.css';

const ARCHIVE_TITLE = 'Archiv';
const ARCHIVE_DESCRIPTION = 'Alle Beiträge nach Jahr geordnet.';

export const metadata: Metadata = {
  title: ARCHIVE_TITLE,
  description: ARCHIVE_DESCRIPTION,
  alternates: {
    canonical: '/blog/archiv',
    languages: {
      [SITE_LANGUAGE]: '/blog/archiv',
      'x-default': '/blog/archiv',
    },
  },
  openGraph: {
    title: `${ARCHIVE_TITLE} | ${SITE_NAME}`,
    description: ARCHIVE_DESCRIPTION,
    type: 'website',
    url: '/blog/archiv',
  },
};

export default function BlogArchivePage() {
  const archive = getArchiveByYear();

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
        name: ARCHIVE_TITLE,
        item: toAbsoluteUrl('/blog/archiv'),
      },
    ],
  };

  return (
    <section className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="container">
        <Link href="/blog" className={styles.back}>← Zurück zum Blog</Link>

        <header className={styles.header}>
          <p className={styles.tag}>Archiv</p>
          <h1 className={styles.title}>Beiträge nach Jahren</h1>
          <p className={styles.subtitle}>
            Alle veröffentlichten Texte in chronologischen Jahresgruppen.
          </p>
        </header>

        <div className={styles.groups}>
          {archive.map((group) => (
            <section key={group.year} className={styles.group}>
              <h2 className={styles.year}>{group.year}</h2>
              <ul className={styles.list}>
                {group.posts.map((post) => (
                  <li key={post.slug} className={styles.item}>
                    <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                      <span className={styles.postTitle}>{post.title}</span>
                      <span className={styles.postMeta}>
                        {formatDate(post.date)} · {post.readingTime} Min.
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

