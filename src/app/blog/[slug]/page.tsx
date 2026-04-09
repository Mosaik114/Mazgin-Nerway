import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { remark } from 'remark';
import html from 'remark-html';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import { getAllPosts, getPostBySlug, getTagSlug } from '@/lib/posts';
import { formatDate, SITE_URL, SOCIAL_LINKS } from '@/lib/config';
import { getCspNonce } from '@/lib/csp';
import ReadingProgress from '@/components/ReadingProgress';
import PostInteractionBar from '@/components/PostInteractionBar';
import {
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_PERSON_GENDER,
  toAbsoluteUrl,
  toIsoDateOrNull,
  toJsonLd,
} from '@/lib/seo';
import styles from './post.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

interface TocHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

function normalizeHeadingId(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'abschnitt';
}

function dedupeHeadingId(base: string, counters: Map<string, number>): string {
  const count = counters.get(base) ?? 0;
  counters.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function extractTocHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const counters = new Map<string, number>();
  let inCodeBlock = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(trimmed);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2]
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim();

    if (!text) continue;

    const baseId = normalizeHeadingId(text);
    const id = dedupeHeadingId(baseId, counters);
    headings.push({ id, level, text });
  }

  return headings;
}

function attachHeadingIdsToHtml(contentHtml: string, tocHeadings: TocHeading[]): string {
  const h2 = tocHeadings.filter((heading) => heading.level === 2);
  const h3 = tocHeadings.filter((heading) => heading.level === 3);
  let h2Index = 0;
  let h3Index = 0;

  return contentHtml
    .replace(/<h2>([\s\S]*?)<\/h2>/g, (_full, inner) => {
      const heading = h2[h2Index++];
      if (!heading) return `<h2>${inner}</h2>`;
      return `<h2 id="${heading.id}">${inner}</h2>`;
    })
    .replace(/<h3>([\s\S]*?)<\/h3>/g, (_full, inner) => {
      const heading = h3[h3Index++];
      if (!heading) return `<h3>${inner}</h3>`;
      return `<h3 id="${heading.id}">${inner}</h3>`;
    });
}

function getComparableTimestamp(date: string, updatedAt?: string): number {
  const source = updatedAt || date;
  const parsed = Date.parse(source);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getSharedTagCount(currentTags: string[], candidateTags: string[]): number {
  if (currentTags.length === 0 || candidateTags.length === 0) return 0;

  const current = new Set(currentTags.map((tag) => getTagSlug(tag)));
  return candidateTags.reduce((count, tag) => {
    return current.has(getTagSlug(tag)) ? count + 1 : count;
  }, 0);
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Beitrag nicht gefunden',
      robots: { index: false, follow: false },
    };
  }

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const canonicalPath = `/blog/${post.slug}`;
  const canonicalMeta = post.canonicalUrl ?? canonicalPath;
  const publishedTime = toIsoDateOrNull(post.date) ?? undefined;
  const modifiedTime = toIsoDateOrNull(post.updatedAt ?? post.date) ?? undefined;

  const ogImage = post.coverImage ?? `/blog/${post.slug}/opengraph-image`;
  const ogAlt = post.coverImageAlt ?? post.title;

  return {
    title,
    description,
    keywords: [...post.tags, post.category, 'Blog', 'Essay', SITE_NAME].filter(
      (value): value is string => Boolean(value),
    ),
    alternates: {
      canonical: canonicalMeta,
      languages: {
        [SITE_LANGUAGE]: canonicalPath,
        'x-default': canonicalPath,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'de_DE',
      title,
      description,
      url: canonicalMeta,
      publishedTime,
      modifiedTime,
      authors: [SITE_NAME],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: ogImage,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const nonce = await getCspNonce();
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const incomingSlug = decodeURIComponent(slug);
  if (incomingSlug !== post.slug) {
    redirect(`/blog/${post.slug}`);
  }

  const processed = await remark().use(html).process(post.content);
  const tocHeadings = extractTocHeadings(post.content);
  const contentHtml = attachHeadingIdsToHtml(processed.toString(), tocHeadings);
  const formatted = formatDate(post.date);

  const getCategoryAccent = (category?: string) => {
    const color = category ? CATEGORY_COLORS[category as Category] : null;

    return {
      color: color ?? 'var(--color-gold)',
      backgroundColor: color ? `${color}1a` : 'rgba(var(--color-gold-rgb), 0.1)',
      borderColor: color ? `${color}66` : 'var(--color-gold-dim)',
    };
  };

  const postAccent = getCategoryAccent(post.category);
  const postStyle = {
    '--post-accent': postAccent.color,
    '--post-accent-bg': postAccent.backgroundColor,
    '--post-accent-border': postAccent.borderColor,
  } as CSSProperties;

  const orderedPosts = getAllPosts();
  const postIndex = orderedPosts.findIndex((candidate) => candidate.slug === post.slug);
  const prevPost = postIndex >= 0 && postIndex < orderedPosts.length - 1
    ? orderedPosts[postIndex + 1]
    : null;
  const nextPost = postIndex > 0 ? orderedPosts[postIndex - 1] : null;
  const allPosts = orderedPosts.filter((candidate) => candidate.slug !== post.slug);

  const relatedByTags = allPosts
    .map((candidate) => ({
      candidate,
      score: getSharedTagCount(post.tags, candidate.tags),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getComparableTimestamp(b.candidate.date, b.candidate.updatedAt)
        - getComparableTimestamp(a.candidate.date, a.candidate.updatedAt);
    })
    .map((item) => item.candidate);

  const related = [...relatedByTags];

  if (related.length < 2 && post.category) {
    const fallback = allPosts
      .filter((candidate) => candidate.category === post.category)
      .filter((candidate) => !related.some((item) => item.slug === candidate.slug))
      .sort((a, b) => getComparableTimestamp(b.date, b.updatedAt) - getComparableTimestamp(a.date, a.updatedAt));

    related.push(...fallback);
  }

  const relatedTop = related.slice(0, 2);

  const canonicalUrl = post.canonicalUrl ?? toAbsoluteUrl(`/blog/${post.slug}`);
  const publishedIso = toIsoDateOrNull(post.date);
  const modifiedIso = toIsoDateOrNull(post.updatedAt ?? post.date);
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    inLanguage: SITE_LANGUAGE,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    ...(post.category ? { articleSection: post.category } : {}),
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    ...(modifiedIso ? { dateModified: modifiedIso } : {}),
    image: post.coverImage
      ? [{
          '@type': 'ImageObject',
          url: toAbsoluteUrl(post.coverImage),
          caption: post.coverImageAlt ?? post.title,
        }]
      : [toAbsoluteUrl(`/blog/${post.slug}/opengraph-image`)],
    keywords: post.tags,
    wordCount,
    timeRequired: `PT${post.readingTime}M`,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#person`,
      name: SITE_NAME,
      gender: SITE_PERSON_GENDER,
      url: toAbsoluteUrl('/about'),
      sameAs: Object.values(SOCIAL_LINKS),
    },
    publisher: {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#person`,
      name: SITE_NAME,
      gender: SITE_PERSON_GENDER,
      url: toAbsoluteUrl('/about'),
    },
    isPartOf: {
      '@type': 'Blog',
      name: `${SITE_NAME} Blog`,
      url: toAbsoluteUrl('/blog'),
    },
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
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <ReadingProgress />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(blogPostingJsonLd) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <article className={styles.page} style={postStyle}>
        <div className="container">
          <Link href="/blog" className={styles.back}>
            ← Zurück zum Blog
          </Link>

          {post.coverImage && (
            <div className={styles.coverWrap}>
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                fill
                sizes="(max-width: 768px) calc(100vw - 2.5rem), (max-width: 1200px) calc(100vw - 3rem), 1052px"
                quality={88}
                className={styles.coverImg}
                priority
              />
            </div>
          )}

          <header className={styles.header}>
            <div className={styles.meta}>
              {post.category && (
                <span
                  className={styles.category}
                  style={{
                    color: postAccent.color,
                    backgroundColor: postAccent.backgroundColor,
                    borderColor: postAccent.borderColor,
                  }}
                >
                  {post.category}
                </span>
              )}
              <time className={styles.date}>{formatted}</time>
              <span className={styles.readTime}>{post.readingTime} Min. Lesezeit</span>
            </div>

            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>

            {post.tags.length > 0 && (
              <ul className={styles.tagList} aria-label="Schlagwörter">
                {post.tags.map((tag) => (
                  <li key={getTagSlug(tag)} className={styles.tagItem}>
                    <Link href={`/blog/tags/${getTagSlug(tag)}`} className={styles.tagLink}>#{tag}</Link>
                  </li>
                ))}
              </ul>
            )}

          </header>

          <div
            className={`${styles.readerLayout} ${tocHeadings.length === 0 ? styles.readerLayoutSingle : ''}`}
          >
            {tocHeadings.length > 0 && (
              <aside className={styles.toc} aria-labelledby="toc-heading">
                <h2 id="toc-heading" className={styles.tocTitle}>Inhalt</h2>
                <ol className={styles.tocList}>
                  {tocHeadings.map((heading) => (
                    <li key={heading.id} className={styles.tocItem}>
                      <a
                        href={`#${heading.id}`}
                        className={`${styles.tocLink} ${heading.level === 3 ? styles.tocLinkSub : ''}`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            <div className={styles.readerMain}>
              <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
              <PostInteractionBar postSlug={post.slug} />
            </div>
          </div>

          <nav className={styles.postNav} aria-label="Beitragsnavigation">
            <div className={styles.navItem}>
              {prevPost && (
                <Link href={`/blog/${prevPost.slug}`} className={styles.navLink}>
                  <span className={styles.navLabel}>← Vorheriger Beitrag</span>
                  <span className={styles.navTitle}>{prevPost.title}</span>
                </Link>
              )}
            </div>
            <div className={`${styles.navItem} ${styles.navItemRight}`}>
              {nextPost && (
                <Link href={`/blog/${nextPost.slug}`} className={`${styles.navLink} ${styles.navLinkRight}`}>
                  <span className={styles.navLabel}>Nächster Beitrag →</span>
                  <span className={styles.navTitle}>{nextPost.title}</span>
                </Link>
              )}
            </div>
          </nav>

          {relatedTop.length > 0 && (
            <aside className={styles.related}>
              <h2 className={styles.relatedTitle}>Weiterlesen zum Thema</h2>
              <div className={styles.relatedGrid}>
                {relatedTop.map((relatedPost) => {
                  const relatedAccent = getCategoryAccent(relatedPost.category);

                  return (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className={styles.relatedCard}>
                      <span
                        className={styles.relatedCategory}
                        style={{
                          color: relatedAccent.color,
                          backgroundColor: relatedAccent.backgroundColor,
                          borderColor: relatedAccent.borderColor,
                        }}
                      >
                        {relatedPost.category ?? 'Beitrag'}
                      </span>
                      <span className={styles.relatedCardTitle}>{relatedPost.title}</span>
                      <span className={styles.relatedExcerpt}>{relatedPost.excerpt}</span>
                      <span className={styles.relatedReadMore}>Lesen →</span>
                    </Link>
                  );
                })}
              </div>
            </aside>
          )}

          <footer className={styles.postFooter}>
            <Link href="/blog" className={styles.backBottom}>
              ← Alle Beiträge
            </Link>
          </footer>
        </div>
      </article>
    </>
  );
}
