'use client';

import { useMemo, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Fuse from 'fuse.js';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import EssayCard from '@/components/EssayCard';
import FavoriteButton from '@/components/FavoriteButton';
import ReadingListButton from '@/components/ReadingListButton';
import MarkReadButton from '@/components/MarkReadButton';
import { useInteractions } from '@/components/InteractionsProvider';
import type { Essay } from '@/lib/essays';
import { formatDate } from '@/lib/config';
import styles from './essay.module.css';

const PAGE_SIZE = 9;

interface Props {
  posts: Essay[];
  categories: string[];
  initialActiveCategory?: string;
  initialQuery?: string;
}

import type { IFuseOptions } from 'fuse.js';

const fuseOptions: IFuseOptions<Essay> = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'category', weight: 1.5 },
    { name: 'excerpt', weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
};

function buildFilterHref(category: string, query: string): string {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (category !== 'Alle') params.set('category', category);
  if (trimmed) params.set('q', trimmed);
  const qs = params.toString();
  return qs ? `/essays?${qs}` : '/essays';
}

export default function EssayList({
  posts,
  categories,
  initialActiveCategory = 'Alle',
  initialQuery = '',
}: Props) {
  const { status } = useSession();
  const interactionsMap = useInteractions();

  const initialActive = categories.includes(initialActiveCategory) ? initialActiveCategory : 'Alle';
  const [active, setActive] = useState(initialActive);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever filter or query changes
  useEffect(() => {
    setPage(1);
  }, [active, query]);

  const fuse = useMemo(() => new Fuse(posts, fuseOptions), [posts]);

  const filtered = useMemo(() => {
    const byCategory = active === 'Alle' ? posts : posts.filter((p) => p.category === active);

    if (!query.trim()) return byCategory;

    const fusePosts = new Fuse(byCategory, fuseOptions);
    return fusePosts.search(query.trim()).map((r) => r.item);
  }, [active, fuse, posts, query]);

  const featured =
    active === 'Alle' && !query.trim() && page === 1
      ? (filtered.find((p) => p.featured) ?? filtered[0])
      : null;

  const listPosts = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;

  const totalPages = Math.max(1, Math.ceil(listPosts.length / PAGE_SIZE));
  const pagePosts = listPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('Alle', posts.length);
    categories
      .filter((cat) => cat !== 'Alle')
      .forEach((cat) => counts.set(cat, posts.filter((p) => p.category === cat).length));
    return counts;
  }, [categories, posts]);

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

  const featuredInteraction = featured ? interactionsMap.get(featured.slug) : undefined;
  const featuredDate = featured ? formatDate(featured.date) : null;
  const featuredAccent = featured?.category
    ? (CATEGORY_COLORS[featured.category as Category] ?? 'var(--color-gold-dim)')
    : 'var(--color-gold-dim)';
  const featuredStyle = { '--featured-accent': featuredAccent } as CSSProperties;

  const hasActiveFilters = active !== 'Alle' || Boolean(query.trim());
  const resultsAnnouncement = `${filtered.length} von ${posts.length} Essays angezeigt.`;

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

            return (
              <Link
                key={cat}
                onClick={() => setActive(cat)}
                className={`${styles.tag} ${isActive ? styles.tagActive : ''}`}
                style={tagStyle}
                href={buildFilterHref(cat, query)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{cat}</span>
                <span className={styles.tagCount}>{count}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.searchWrap}>
          <label htmlFor="essay-search" className={styles.searchLabel}>Suche</label>
          <input
            id="essay-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nach Titel, Text oder Kategorie suchen"
            className={styles.searchInput}
            autoComplete="off"
            enterKeyHint="search"
            aria-describedby="essay-results-status"
          />
        </div>
      </div>

      <p id="essay-results-status" className="sr-only" aria-live="polite">
        {resultsAnnouncement}
      </p>

      {hasActiveFilters && (
        <div className={styles.filterInfo}>
          <p>
            Aktive Filter:
            {active !== 'Alle' && ` Kategorie „${active}"`}
            {active !== 'Alle' && query.trim() && ' ·'}
            {query.trim() && ` Suche „${query.trim()}"`}
          </p>
          <Link href="/essays" className={styles.clearBtn}>
            Filter zurücksetzen
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Für diese Auswahl wurden keine Essays gefunden.</p>
          <Link href="/essays" className={styles.clearBtn}>
            Alle Essays anzeigen
          </Link>
        </div>
      ) : (
        <>
          {featured && (
            <Link href={`/essays/${featured.slug}`} className={styles.featured} style={featuredStyle}>
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
                  <span>{featured.category ?? 'Essay'}</span>
                </div>
              )}

              {status === 'authenticated' && (
                <div className={styles.featuredActions}>
                  <MarkReadButton
                    essaySlug={featured.slug}
                    initialIsRead={featuredInteraction?.isRead}
                    variant="icon"
                  />
                  <FavoriteButton
                    essaySlug={featured.slug}
                    initialFavorite={featuredInteraction?.isFavorite}
                    variant="icon"
                  />
                  <ReadingListButton
                    essaySlug={featured.slug}
                    initialOnList={featuredInteraction?.isOnReadingList}
                    variant="icon"
                  />
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

          {pagePosts.length > 0 && (
            <div className={styles.grid}>
              {pagePosts.map((post) => {
                const interaction = interactionsMap.get(post.slug);
                return (
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
                    isRead={interaction?.isRead}
                    isFavorite={interaction?.isFavorite}
                    isOnReadingList={interaction?.isOnReadingList}
                    showActions={status === 'authenticated'}
                  />
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Seitennavigation">
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Vorherige Seite"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`Seite ${p}`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Nächste Seite"
              >
                →
              </button>
            </nav>
          )}
        </>
      )}

      <p className={styles.count}>
        {filtered.length} von {posts.length} Essays
        {active !== 'Alle' && ` in „${active}"`}
        {query.trim() && ` mit „${query.trim()}"`}
        {totalPages > 1 && ` · Seite ${page} von ${totalPages}`}
      </p>
    </>
  );
}
