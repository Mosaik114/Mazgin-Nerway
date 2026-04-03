'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  const filtered = active === 'Alle'
    ? posts
    : posts.filter((p) => p.category === active);

  // Featured: explizit markiert oder neuester Post wenn kein Filter aktiv
  const featured = active === 'Alle'
    ? (filtered.find((p) => p.featured) ?? filtered[0])
    : null;
  const rest = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;

  const featuredDate = featured ? formatDate(featured.date) : null;

  return (
    <>
      {/* Kategorie-Tags */}
      <div className={styles.tags}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`${styles.tag} ${active === cat ? styles.tagActive : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>Keine Beiträge in dieser Kategorie.</p>
      ) : (
        <>
          {/* Featured Post */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className={styles.featured}>
              {featured.coverImage && (
                <div className={styles.featuredCover}>
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.featuredCoverImg}
                  />
                </div>
              )}
              <div className={styles.featuredBody}>
                <div className={styles.featuredMeta}>
                  {featured.category && (
                    <span className={styles.featuredCategory}>{featured.category}</span>
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

          {/* Rest als Grid */}
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
        {filtered.length} Beitrag{filtered.length !== 1 ? 'e' : ''}
        {active !== 'Alle' && ` in „${active}"`}
      </p>
    </>
  );
}
