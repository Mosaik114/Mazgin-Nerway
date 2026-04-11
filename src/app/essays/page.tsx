import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEssays, getAllTagsWithCount } from '@/lib/essays';
import { CATEGORIES } from '@/lib/categories';
import { formatDate, SITE_URL } from '@/lib/config';
import { getCspNonce } from '@/lib/csp';
import {
  buildBreadcrumbJsonLd,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_PERSON_GENDER,
  toAbsoluteUrl,
  toIsoDateOrNull,
  toJsonLd,
} from '@/lib/seo';
import { firstParamValue, type SearchParamValue } from '@/lib/auth-redirect';
import EssayList from './EssayList';
import styles from './essay.module.css';

const ESSAYS_TITLE = 'Essays';
type EssaySearchParams = Record<string, SearchParamValue>;

interface EssayPageProps {
  searchParams?: Promise<EssaySearchParams>;
}

const ESSAYS_DESCRIPTION = 'Alle Essays von Mizgin Nerway - Gedanken, Geschichten und Reflexionen.';

export const metadata: Metadata = {
  title: ESSAYS_TITLE,
  description: ESSAYS_DESCRIPTION,
  alternates: {
    canonical: '/essays',
    languages: {
      [SITE_LANGUAGE]: '/essays',
      'x-default': '/essays',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: `${ESSAYS_TITLE} | ${SITE_NAME}`,
    description: ESSAYS_DESCRIPTION,
    url: '/essays',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Essays`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${ESSAYS_TITLE} | ${SITE_NAME}`,
    description: ESSAYS_DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default async function EssaysPage({ searchParams }: EssayPageProps) {
  const nonce = await getCspNonce();
  const posts = getAllEssays();
  const tags = getAllTagsWithCount();
  const postCategories = Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );
  const knownCategorySet = new Set<string>(CATEGORIES);
  const usedKnownCategories = CATEGORIES.filter((cat) => postCategories.includes(cat));
  const usedNewCategories = postCategories.filter((category) => !knownCategorySet.has(category));
  const categories = ['Alle', ...usedKnownCategories, ...usedNewCategories];
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedCategory = firstParamValue(resolvedSearchParams.category).trim();
  const requestedQuery = firstParamValue(resolvedSearchParams.q).trim();
  const initialActiveCategory =
    requestedCategory && categories.includes(requestedCategory) ? requestedCategory : 'Alle';
  const initialQuery = requestedQuery;
  const latestPost = posts[0];
  const latestPostIso = latestPost ? toIsoDateOrNull(latestPost.date) : null;
  const totalReadingTime = posts.reduce((sum, post) => sum + post.readingTime, 0);

  const essaysJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Essays`,
    url: toAbsoluteUrl('/essays'),
    description: ESSAYS_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#person`,
      name: SITE_NAME,
      gender: SITE_PERSON_GENDER,
    },
    ...(latestPostIso ? { dateModified: latestPostIso } : {}),
    blogPost: posts.map((post) => {
      const published = toIsoDateOrNull(post.date);

      return {
        '@type': 'Article',
        headline: post.seoTitle ?? post.title,
        url: toAbsoluteUrl(`/essays/${post.slug}`),
        description: post.seoDescription ?? post.excerpt,
        ...(published ? { datePublished: published } : {}),
      };
    }),
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: 'Essays', path: '/essays' }]);

  return (
    <section className={styles.page}>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(essaysJsonLd) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="container">
        <header className={styles.header}>
          <p className={styles.pageTag}>Essays</p>
          <h1 className={styles.pageTitle}>Die Bibliothek meiner Gedanken</h1>
          <div className={styles.exploreLinks}>
            <Link href="/essays/tags" className={styles.exploreLink}>Nach Schlagwort stöbern</Link>
            <Link href="/essays/archiv" className={styles.exploreLink}>Archiv nach Jahr</Link>
          </div>
        </header>

        <EssayList
          key={`${initialActiveCategory}|${initialQuery}`}
          posts={posts}
          categories={categories}
          initialActiveCategory={initialActiveCategory}
          initialQuery={initialQuery}
        />

        <div className={styles.stats}>
          <span className={styles.stat}>{posts.length} Essays</span>
          <span className={styles.stat}>{tags.length} Schlagwörter</span>
          <span className={styles.stat}>{totalReadingTime} Min. Gesamtlesezeit</span>
          {latestPost && <span className={styles.stat}>Neu: {formatDate(latestPost.date)}</span>}
        </div>
      </div>
    </section>
  );
}
