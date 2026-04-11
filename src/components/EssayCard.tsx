import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { getCategoryAccent } from '@/lib/categories';
import { formatDate } from '@/lib/config';
import FavoriteButton from './FavoriteButton';
import ReadingListButton from './ReadingListButton';
import MarkReadButton from './MarkReadButton';
import styles from './EssayCard.module.css';

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
  isFavorite?: boolean;
  isOnReadingList?: boolean;
  showActions?: boolean;
}

export default function EssayCard({
  title,
  slug,
  date,
  excerpt,
  category,
  coverImage,
  coverImageAlt,
  readingTime,
  isRead,
  isFavorite,
  isOnReadingList,
  showActions = false,
}: Props) {
  const formatted = formatDate(date);
  const accent = getCategoryAccent(category);
  const cardStyle = { '--card-accent': accent.color } as CSSProperties;

  return (
    <Link href={`/essays/${slug}`} className={styles.card} style={cardStyle}>
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
            <MarkReadButton essaySlug={slug} initialIsRead={isRead} variant="icon" />
            <FavoriteButton essaySlug={slug} initialFavorite={isFavorite} variant="icon" />
            <ReadingListButton essaySlug={slug} initialOnList={isOnReadingList} variant="icon" />
          </div>
        )}
        <div className={styles.body}>
          <div className={styles.meta}>
            {category && (
              <span
                className={styles.category}
                style={{
                  color: accent.color,
                  backgroundColor: accent.backgroundColor,
                  borderColor: accent.borderColor,
                }}
              >
                {category}
              </span>
            )}
            <time className={styles.date}>{formatted}</time>
            {readingTime && <span className={styles.readTime}>{readingTime} Min.</span>}
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.excerpt}>{excerpt}</p>
          <span className={styles.readMore}>Weiterlesen →</span>
        </div>
      </article>
    </Link>
  );
}
