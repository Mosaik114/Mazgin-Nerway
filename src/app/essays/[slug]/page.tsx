import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryAccent } from '@/lib/categories';
import { getAllEssays, getEssayBySlug, getEssayNavigation, getTagSlug } from '@/lib/essays';
import { formatDate, SITE_URL, SOCIAL_LINKS } from '@/lib/config';
import { getCspNonce } from '@/lib/csp';
import ReadingProgress from '@/components/ReadingProgress';
import EssayInteractionBar from '@/components/EssayInteractionBarClient';
import {
  buildBreadcrumbJsonLd,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_PERSON_GENDER,
  toAbsoluteUrl,
  toIsoDateOrNull,
  toJsonLd,
} from '@/lib/seo';
import styles from './essay.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEssays().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getEssayBySlug(slug);

  if (!post) {
    return {
      title: 'Essay nicht gefunden',
      robots: { index: false, follow: false },
    };
  }

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const canonicalPath = `/essays/${post.slug}`;
  const canonicalMeta = post.canonicalUrl ?? canonicalPath;
  const publishedTime = toIsoDateOrNull(post.date) ?? undefined;
  const modifiedTime = toIsoDateOrNull(post.updatedAt ?? post.date) ?? undefined;

  const ogImage = post.coverImage ?? `/essays/${post.slug}/opengraph-image`;
  const ogAlt = post.coverImageAlt ?? post.title;

  return {
    title,
    description,
    keywords: [...post.tags, post.category, 'Essay', SITE_NAME].filter(
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

export default async function EssayPostPage({ params }: Props) {
  const nonce = await getCspNonce();
  const { slug } = await params;
  const post = getEssayBySlug(slug);
  if (!post) notFound();

  const incomingSlug = decodeURIComponent(slug);
  if (incomingSlug !== post.slug) {
    redirect(`/essays/${post.slug}`);
  }

  const { contentHtml, tocHeadings } = post;
  const formatted = formatDate(post.date);

  const essayAccent = getCategoryAccent(post.category);
  const essayStyle = {
    '--essay-accent': essayAccent.color,
    '--essay-accent-bg': essayAccent.backgroundColor,
    '--essay-accent-border': essayAccent.borderColor,
  } as CSSProperties;

  const { prevPost, nextPost, related: relatedTop } = getEssayNavigation(post);

  const canonicalUrl = post.canonicalUrl ?? toAbsoluteUrl(`/essays/${post.slug}`);
  const publishedIso = toIsoDateOrNull(post.date);
  const modifiedIso = toIsoDateOrNull(post.updatedAt ?? post.date);
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;

  const essayJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
      : [toAbsoluteUrl(`/essays/${post.slug}/opengraph-image`)],
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
      name: `${SITE_NAME} Essays`,
      url: toAbsoluteUrl('/essays'),
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Essays', path: '/essays' },
    { name: post.title, path: `/essays/${post.slug}` },
  ]);

  return (
    <>
      <ReadingProgress />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(essayJsonLd) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <article className={styles.page} style={essayStyle}>
        <div className="container">
          <Link href="/essays" className={styles.back}>
            ← Zurück zu Essays
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
                    color: essayAccent.color,
                    backgroundColor: essayAccent.backgroundColor,
                    borderColor: essayAccent.borderColor,
                  }}
                >
                  {post.category}
                </span>
              )}
              <time dateTime={post.date} className={styles.date}>{formatted}</time>
              <span className={styles.readTime}>{post.readingTime} Min. Lesezeit</span>
            </div>

            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>

            <div className={styles.tagActionRow}>
              {post.tags.length > 0 && (
                <ul className={styles.tagList} aria-label="Schlagwörter">
                  {post.tags.map((tag) => (
                    <li key={getTagSlug(tag)} className={styles.tagItem}>
                      <Link href={`/essays/tags/${getTagSlug(tag)}`} className={styles.tagLink}>#{tag}</Link>
                    </li>
                  ))}
                </ul>
              )}
              <EssayInteractionBar essaySlug={post.slug} />
            </div>

            <div className={styles.ornament}>
              <span>✦</span>
            </div>
          </header>

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

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />

          <nav className={styles.postNav} aria-label="Essaynavigation">
            <div className={styles.navItem}>
              {prevPost && (
                <Link href={`/essays/${prevPost.slug}`} className={styles.navLink}>
                  <span className={styles.navLabel}>← Vorheriger Essay</span>
                  <span className={styles.navTitle}>{prevPost.title}</span>
                </Link>
              )}
            </div>
            <div className={`${styles.navItem} ${styles.navItemRight}`}>
              {nextPost && (
                <Link href={`/essays/${nextPost.slug}`} className={`${styles.navLink} ${styles.navLinkRight}`}>
                  <span className={styles.navLabel}>Nächster Essay →</span>
                  <span className={styles.navTitle}>{nextPost.title}</span>
                </Link>
              )}
            </div>
          </nav>

          {relatedTop.length > 0 && (
            <aside className={styles.related}>
              <div className={styles.ornament}>
                <span>✦</span>
              </div>
              <h2 className={styles.relatedTitle}>Weiterlesen zum Thema</h2>
              <div className={styles.relatedGrid}>
                {relatedTop.map((relatedPost) => {
                  const relatedAccent = getCategoryAccent(relatedPost.category);

                  return (
                    <Link key={relatedPost.slug} href={`/essays/${relatedPost.slug}`} className={styles.relatedCard}>
                      <span
                        className={styles.relatedCategory}
                        style={{
                          color: relatedAccent.color,
                          backgroundColor: relatedAccent.backgroundColor,
                          borderColor: relatedAccent.borderColor,
                        }}
                      >
                        {relatedPost.category ?? 'Essay'}
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
            <div className={styles.ornament}>
              <span>✦</span>
            </div>
            <Link href="/essays" className={styles.backBottom}>
              ← Alle Essays
            </Link>
          </footer>
        </div>
      </article>
    </>
  );
}
