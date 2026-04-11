import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EssayCard from '@/components/EssayCard';
import {
  getAllTagsWithCount,
  getEssaysByTagSlug,
  getTagInfoBySlug,
} from '@/lib/essays';
import { getCspNonce } from '@/lib/csp';
import { buildBreadcrumbJsonLd, SITE_LANGUAGE, SITE_NAME, toJsonLd } from '@/lib/seo';
import styles from './tag.module.css';

interface Props {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTagsWithCount().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const tagInfo = getTagInfoBySlug(tag);

  if (!tagInfo) {
    return {
      title: 'Schlagwort nicht gefunden',
      robots: { index: false, follow: false },
    };
  }

  const title = `Schlagwort: ${tagInfo.name}`;
  const description = `Essays zum Thema "${tagInfo.name}" auf ${SITE_NAME}.`;
  const canonicalPath = `/essays/tags/${tagInfo.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        [SITE_LANGUAGE]: canonicalPath,
        'x-default': canonicalPath,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: 'website',
      url: canonicalPath,
    },
  };
}

export default async function TagPage({ params }: Props) {
  const nonce = await getCspNonce();
  const { tag } = await params;
  const tagInfo = getTagInfoBySlug(tag);
  if (!tagInfo) notFound();

  const posts = getEssaysByTagSlug(tagInfo.slug);
  if (posts.length === 0) notFound();

  const canonicalPath = `/essays/tags/${tagInfo.slug}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Essays', path: '/essays' },
    { name: 'Schlagwörter', path: '/essays/tags' },
    { name: tagInfo.name, path: canonicalPath },
  ]);

  return (
    <section className={styles.page}>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="container">
        <Link href="/essays/tags" className={styles.back}>← Zurück zu Schlagwörtern</Link>

        <header className={styles.header}>
          <p className={styles.tag}>Schlagwort</p>
          <h1 className={styles.title}>{tagInfo.name}</h1>
          <p className={styles.subtitle}>{posts.length} Essays zu diesem Thema</p>
        </header>

        <div className={styles.grid}>
          {posts.map((post) => (
            <EssayCard
              key={post.slug}
              title={post.title}
              slug={post.slug}
              date={post.date}
              excerpt={post.excerpt}
              category={post.category}
              coverImage={post.coverImage}
              coverImageAlt={post.coverImageAlt}
              readingTime={post.readingTime}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
