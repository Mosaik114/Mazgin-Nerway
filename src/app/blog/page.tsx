import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getAllTagsWithCount } from '@/lib/posts';
import { CATEGORIES } from '@/lib/categories';
import { formatDate, SITE_URL } from '@/lib/config';
import {
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_PERSON_GENDER,
  toAbsoluteUrl,
  toIsoDateOrNull,
  toJsonLd,
} from '@/lib/seo';
import BlogList from './BlogList';
import styles from './blog.module.css';

const BLOG_TITLE = 'Blog';
type SearchParamValue = string | string[] | undefined;
type BlogSearchParams = Record<string, SearchParamValue>;

interface BlogPageProps {
  searchParams?: Promise<BlogSearchParams>;
}

function firstParamValue(value: SearchParamValue): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

const BLOG_DESCRIPTION = 'Alle Beiträge von Mazgin Nerway - Gedanken, Geschichten und Reflexionen.';

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: '/blog',
    languages: {
      [SITE_LANGUAGE]: '/blog',
      'x-default': '/blog',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: `${BLOG_TITLE} | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    url: '/blog',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Blog`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BLOG_TITLE} | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const posts = getAllPosts();
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

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    url: toAbsoluteUrl('/blog'),
    description: BLOG_DESCRIPTION,
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
        '@type': 'BlogPosting',
        headline: post.seoTitle ?? post.title,
        url: toAbsoluteUrl(`/blog/${post.slug}`),
        description: post.seoDescription ?? post.excerpt,
        ...(published ? { datePublished: published } : {}),
      };
    }),
  };

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
    ],
  };

  return (
    <section className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="container">
        <header className={styles.header}>
          <p className={styles.pageTag}>Blog</p>
          <h1 className={styles.pageTitle}>Die Bibliothek meiner Gedanken</h1>
          <div className={styles.exploreLinks}>
            <Link href="/blog/tags" className={styles.exploreLink}>Nach Schlagwort stöbern</Link>
            <Link href="/blog/archiv" className={styles.exploreLink}>Archiv nach Jahr</Link>
          </div>
        </header>

        <BlogList
          key={`${initialActiveCategory}|${initialQuery}`}
          posts={posts}
          categories={categories}
          initialActiveCategory={initialActiveCategory}
          initialQuery={initialQuery}
        />

        <div className={styles.stats}>
          <span className={styles.stat}>{posts.length} Beiträge</span>
          <span className={styles.stat}>{tags.length} Schlagwörter</span>
          <span className={styles.stat}>{totalReadingTime} Min. Gesamtlesezeit</span>
          {latestPost && <span className={styles.stat}>Neu: {formatDate(latestPost.date)}</span>}
        </div>
      </div>
    </section>
  );
}
