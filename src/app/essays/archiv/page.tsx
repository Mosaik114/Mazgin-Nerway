import type { Metadata } from 'next';
import Link from 'next/link';
import { getArchiveByYear } from '@/lib/essays';
import { formatDate } from '@/lib/config';
import { getCspNonce } from '@/lib/csp';
import { buildBreadcrumbJsonLd, SITE_LANGUAGE, SITE_NAME, toJsonLd } from '@/lib/seo';
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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Essays', path: '/essays' },
    { name: ARCHIVE_TITLE, path: '/essays/archiv' },
  ]);

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
                        <time dateTime={essay.date}>{formatDate(essay.date)}</time> · {essay.readingTime} Min.
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
