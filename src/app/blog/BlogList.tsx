'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import BlogCard from '@/components/BlogCard';
import type { Post } from '@/lib/posts';
import { formatDate } from '@/lib/config';
import styles from './blog.module.css';

interface Props {
  posts: Post[];
  categories: string[];
  initialActiveCategory?: string;
  initialQuery?: string;
}

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00DF/g, 'ss');
}

export default function BlogList({
  posts,
  categories,
  initialActiveCategory = 'Alle',
  initialQuery = '',
}: Props) {
  const initialActive = categories.includes(initialActiveCategory) ? initialActiveCategory : 'Alle';
  const [active, setActive] = useState(initialActive);
  const [query, setQuery] = useState(initialQuery);
  const normalizedQuery = normalizeForSearch(query.trim());

  const buildFilterHref = (category: string, nextQuery: string): string => {
    const params = new URLSearchParams();
    const trimmedQuery = nextQuery.trim();

    if (category !== 'Alle') params.set('category', category);
    if (trimmedQuery) params.set('q', trimmedQuery);

    const queryString = params.toString();
    return queryString ? `/blog?${queryString}` : '/blog';
  };

  const getTagAccent = (category: string) => {
    const color =
      category === 'Alle'
        ? 'var(--color-gold)'
        : (CATEGORY_COLORS[category as Category] ?? 'var(--color-gold)');

    return {
      color,
      backgroundColor: category === 'Alle' ? 'rgba(var(--color-gold-rgb), 0.08)' : `${color}1a`,
      borderColor: category === 'Alle' ? 'var(--color-gold-dim)' : `${color}66`,
    };
  };

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('Alle', posts.length);
    categories
      .filter((cat) => cat !== 'Alle')
      .forEach((cat) => {
        counts.set(cat, posts.filter((post) => post.category === cat).length);
      });
    return counts;
  }, [categories, posts]);

  const filtered = useMemo(() => {
    const byCategory = active === 'Alle' ? posts : posts.filter((post) => post.category === active);
    if (!normalizedQuery) return byCategory;

    return byCategory.filter((post) => {
      const haystack = [post.title, post.excerpt, post.category, ...post.tags]
        .filter(Boolean)
        .join(' ');

      const normalizedHaystack = normalizeForSearch(haystack);
      return normalizedHaystack.includes(normalizedQuery);
    });
  }, [active, normalizedQuery, posts]);

  const featured =
    active === 'Alle' && !normalizedQuery
      ? (filtered.find((post) => post.featured) ?? filtered[0])
      : null;

  const rest = featured ? filtered.filter((post) => post.slug !== featured.slug) : filtered;
  const featuredDate = featured ? formatDate(featured.date) : null;
  const featuredAccent = featured?.category
    ? (CATEGORY_COLORS[featured.category as Category] ?? 'var(--color-gold-dim)')
    : 'var(--color-gold-dim)';
  const featuredStyle = { '--featured-accent': featuredAccent } as CSSProperties;
  const hasActiveFilters = active !== 'Alle' || Boolean(normalizedQuery);
  const resultsAnnouncement = `${filtered.length} von ${posts.length} Beiträgen angezeigt.`;

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.tags} role="group" aria-label="Kategorien filtern">
          {categories.map((cat) => {
            const isActive = active === cat;
            const count = categoryCounts.get(cat) ?? 0;
            const tagAccent = getTagAccent(cat);
            const tagStyle = {
              '--tag-accent': tagAccent.color,
              '--tag-accent-bg': tagAccent.backgroundColor,
              '--tag-accent-border': tagAccent.borderColor,
            } as CSSProperties;
            const href = buildFilterHref(cat, query);

            return (
              <Link
                key={cat}
                onClick={() => setActive(cat)}
                className={`${styles.tag} ${isActive ? styles.tagActive : ''}`}
                style={tagStyle}
                href={href}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{cat}</span>
                <span className={styles.tagCount}>{count}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.searchWrap}>
          <label htmlFor="blog-search" className={styles.searchLabel}>Suche</label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nach Titel, Text oder Kategorie suchen"
            className={styles.searchInput}
            autoComplete="off"
            enterKeyHint="search"
            aria-describedby="blog-results-status"
          />
        </div>
      </div>

      <p id="blog-results-status" className="sr-only" aria-live="polite">
        {resultsAnnouncement}
      </p>

      {hasActiveFilters && (
        <div className={styles.filterInfo}>
          <p>
            Aktive Filter:
            {active !== 'Alle' && ` Kategorie „${active}“`}
            {active !== 'Alle' && normalizedQuery && ' ·'}
            {normalizedQuery && ` Suche „${query.trim()}“`}
          </p>
          <Link href="/blog" className={styles.clearBtn}>
            Filter zurücksetzen
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Für diese Auswahl wurden keine Beiträge gefunden.</p>
          <Link href="/blog" className={styles.clearBtn}>
            Alle Beiträge anzeigen
          </Link>
        </div>
      ) : (
        <>
          {featured && (
            <Link href={`/blog/${featured.slug}`} className={styles.featured} style={featuredStyle}>
              {featured.coverImage ? (
                <div className={styles.featuredCover}>
                  <Image
                    src={featured.coverImage}
                    alt={featured.coverImageAlt ?? featured.title}
                    fill
                    sizes="(max-width: 768px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 580px"
                    quality={88}
                    className={styles.featuredCoverImg}
                  />
                </div>
              ) : (
                <div className={styles.featuredFallback} aria-hidden>
                  <span>{featured.category ?? 'Beitrag'}</span>
                </div>
              )}

              <div className={styles.featuredBody}>
                <div className={styles.featuredMeta}>
                  {featured.category && (
                    <span
                      className={styles.featuredCategory}
                      style={{
                        color: CATEGORY_COLORS[featured.category as Category] ?? 'var(--color-gold)',
                        backgroundColor: `${CATEGORY_COLORS[featured.category as Category] ?? 'var(--color-gold)'}1a`,
                        borderColor: `${CATEGORY_COLORS[featured.category as Category] ?? 'var(--color-gold)'}66`,
                      }}
                    >
                      {featured.category}
                    </span>
                  )}
                  <time className={styles.featuredDate}>{featuredDate}</time>
                  <span className={styles.featuredReadTime}>{featured.readingTime} Min.</span>
                </div>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                <span className={styles.featuredReadMore}>Weiterlesen →</span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className={styles.grid}>
              {rest.map((post) => (
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
          )}
        </>
      )}

      <p className={styles.count}>
        {filtered.length} von {posts.length} Beiträgen
        {active !== 'Alle' && ` in „${active}“`}
        {normalizedQuery && ` mit „${query.trim()}“`}
      </p>
    </>
  );
}
