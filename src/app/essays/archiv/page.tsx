import type { Metadata } from 'next';
import Link from 'next/link';
import { getArchiveByYear } from '@/lib/essays';
import { formatDate } from '@/lib/config';
import { getCspNonce } from '@/lib/csp';
import { SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl, toJsonLd } from '@/lib/seo';
import styles from './archiv.module.css';

const ARCHIVE_TITLE = 'Archiv';
const ARCHIVE_DESCRIPTION = 'Alle Essays nach Jahr geordnet.';

export const metadata: Metadata = {
  title: ARCHIVE_TITLE,
  description: ARCHIVE_DESCRIPTION,
  alternates: {
    canonical: '/essays/archiv',
    languages: {
      [SITE_LANGUAGE]: '/essays/archiv',
      'x-default': '/essays/archiv',
    },
  },
  openGraph: {
    title: `${ARCHIVE_TITLE} | ${SITE_NAME}`,
    description: ARCHIVE_DESCRIPTION,
    type: 'website',
    url: '/essays/archiv',
  },
};

export default async function ArchivePage() {
  const nonce = await getCspNonce();
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
        name: 'Essays',
        item: toAbsoluteUrl('/essays'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: ARCHIVE_TITLE,
        item: toAbsoluteUrl('/essays/archiv'),
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
        <Link href="/essays" className={styles.back}>← Zurück zu Essays</Link>

        <header className={styles.header}>
          <p className={styles.tag}>Archiv</p>
          <h1 className={styles.title}>Essays nach Jahren</h1>
          <p className={styles.subtitle}>
            Alle veröffentlichten Texte in chronologischen Jahresgruppen.
          </p>
        </header>

        <div className={styles.groups}>
          {archive.map((group) => (
            <section key={group.year} className={styles.group}>
              <h2 className={styles.year}>{group.year}</h2>
              <ul className={styles.list}>
                {group.essays.map((essay) => (
                  <li key={essay.slug} className={styles.item}>
                    <Link href={`/essays/${essay.slug}`} className={styles.postLink}>
                      <span className={styles.postTitle}>{essay.title}</span>
                      <span className={styles.postMeta}>
                        {formatDate(essay.date)} · {essay.readingTime} Min.
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
