import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
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

export default function BlogCard({ title, slug, date, excerpt, category, coverImage, readingTime }: Props) {
  const formatted = new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link href={`/blog/${slug}`} className={styles.card}>
      <article>
        {coverImage && (
          <div className={styles.cover}>
            <Image src={coverImage} alt={title} fill sizes="(max-width: 768px) 100vw, 600px" className={styles.coverImg} />
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
