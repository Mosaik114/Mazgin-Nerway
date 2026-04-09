import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCard from '@/components/BlogCard';
import {
  getAllTagsWithCount,
  getPostsByTagSlug,
  getTagInfoBySlug,
} from '@/lib/posts';
import { getCspNonce } from '@/lib/csp';
import { SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl, toJsonLd } from '@/lib/seo';
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
  const description = `Beiträge zum Thema "${tagInfo.name}" auf ${SITE_NAME}.`;
  const canonicalPath = `/blog/tags/${tagInfo.slug}`;

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

export default async function BlogTagPage({ params }: Props) {
  const nonce = await getCspNonce();
  const { tag } = await params;
  const tagInfo = getTagInfoBySlug(tag);
  if (!tagInfo) notFound();

  const posts = getPostsByTagSlug(tagInfo.slug);
  if (posts.length === 0) notFound();

  const canonicalPath = `/blog/tags/${tagInfo.slug}`;

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
        name: 'Schlagwörter',
        item: toAbsoluteUrl('/blog/tags'),
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tagInfo.name,
        item: toAbsoluteUrl(canonicalPath),
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
        <Link href="/blog/tags" className={styles.back}>← Zurück zu Schlagwörtern</Link>

        <header className={styles.header}>
          <p className={styles.tag}>Schlagwort</p>
          <h1 className={styles.title}>{tagInfo.name}</h1>
          <p className={styles.subtitle}>{posts.length} Beiträge zu diesem Thema</p>
        </header>

        <div className={styles.grid}>
          {posts.map((post) => (
            <BlogCard
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
