import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import { formatDate } from '@/lib/config';
import styles from './BlogCard.module.css';

interface Props {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  category?: string;
  coverImage?: string;
  readingTime?: number;
}

export default function BlogCard({
  title,
  slug,
  date,
  excerpt,
  category,
  coverImage,
  readingTime,
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
              alt={title}
              fill
              sizes="(max-width: 768px) calc(100vw - 2.5rem), (max-width: 1200px) 50vw, 360px"
              quality={92}
              className={styles.coverImg}
            />
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
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.excerpt}>{excerpt}</p>
          <span className={styles.readMore}>Weiterlesen →</span>
        </div>
      </article>
    </Link>
  );
}
