'use client';

import { useMemo, useState } from 'react';
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
}

export default function BlogList({ posts, categories }: Props) {
  const [active, setActive] = useState('Alle');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

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
      const haystack = [post.title, post.excerpt, post.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [active, normalizedQuery, posts]);

  const featured =
    active === 'Alle' && !normalizedQuery
      ? (filtered.find((post) => post.featured) ?? filtered[0])
      : null;

  const rest = featured ? filtered.filter((post) => post.slug !== featured.slug) : filtered;
  const featuredDate = featured ? formatDate(featured.date) : null;
  const hasActiveFilters = active !== 'Alle' || Boolean(normalizedQuery);

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.tags} role="group" aria-label="Kategorien filtern">
          {categories.map((cat) => {
            const isActive = active === cat;
            const count = categoryCounts.get(cat) ?? 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`${styles.tag} ${isActive ? styles.tagActive : ''}`}
                aria-pressed={isActive}
              >
                <span>{cat}</span>
                <span className={styles.tagCount}>{count}</span>
              </button>
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
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className={styles.filterInfo}>
          <p>
            Aktive Filter:
            {active !== 'Alle' && ` Kategorie „${active}“`}
            {active !== 'Alle' && normalizedQuery && ' ·'}
            {normalizedQuery && ` Suche „${query.trim()}“`}
          </p>
          <button
            type="button"
            onClick={() => {
              setActive('Alle');
              setQuery('');
            }}
            className={styles.clearBtn}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Für diese Auswahl wurden keine Beiträge gefunden.</p>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setActive('Alle');
              setQuery('');
            }}
          >
            Alle Beiträge anzeigen
          </button>
        </div>
      ) : (
        <>
          {featured && (
            <Link href={`/blog/${featured.slug}`} className={styles.featured}>
              {featured.coverImage ? (
                <div className={styles.featuredCover}>
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    quality={92}
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
