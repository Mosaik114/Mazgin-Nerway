import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import { formatDate } from '@/lib/config';
import FavoriteButton from './FavoriteButton';
import ReadingListButton from './ReadingListButton';
import styles from './BlogCard.module.css';

interface Props {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  category?: string;
  coverImage?: string;
  coverImageAlt?: string;
  readingTime?: number;
  isRead?: boolean;
  hasBookmark?: boolean;
  isFavorite?: boolean;
  isOnReadingList?: boolean;
  showActions?: boolean;
}

export default function BlogCard({
  title,
  slug,
  date,
  excerpt,
  category,
  coverImage,
  coverImageAlt,
  readingTime,
  isRead,
  hasBookmark,
  isFavorite,
  isOnReadingList,
  showActions = false,
}: Props) {
  const formatted = formatDate(date);
  const accentColor = category
    ? (CATEGORY_COLORS[category as Category] ?? 'var(--color-gold-dim)')
    : 'var(--color-gold-dim)';
  const cardStyle = { '--card-accent': accentColor } as CSSProperties;

  return (
    <Link href={`/blog/${slug}`} className={styles.card} style={cardStyle}>
      <article>
        {coverImage && (
          <div className={styles.cover}>
            <Image
              src={coverImage}
              alt={coverImageAlt ?? title}
              fill
              sizes="(max-width: 768px) calc(100vw - 2.5rem), (max-width: 1200px) 50vw, 360px"
              quality={86}
              className={styles.coverImg}
            />
          </div>
        )}
        {showActions && (
          <div className={styles.actions}>
            <FavoriteButton postSlug={slug} initialFavorite={isFavorite} variant="icon" />
            <ReadingListButton postSlug={slug} initialOnList={isOnReadingList} variant="icon" />
          </div>
        )}
        <div className={styles.body}>
          <div className={styles.meta}>
            {category && (
              <span
                className={styles.category}
                style={{
                  color: CATEGORY_COLORS[category as Category] ?? 'var(--color-gold)',
                  backgroundColor: `${CATEGORY_COLORS[category as Category] ?? 'var(--color-gold)'}1a`,
                  borderColor: `${CATEGORY_COLORS[category as Category] ?? 'var(--color-gold)'}66`,
                }}
              >
                {category}
              </span>
            )}
            <time className={styles.date}>{formatted}</time>
            {readingTime && <span className={styles.readTime}>{readingTime} Min.</span>}
            {hasBookmark && <span className={styles.bookmarkBadge} title="Lesezeichen gesetzt">🔖</span>}
            {isRead && <span className={styles.readBadge} title="Gelesen">✓</span>}
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.excerpt}>{excerpt}</p>
          <span className={styles.readMore}>Weiterlesen →</span>
        </div>
      </article>
    </Link>
  );
}
