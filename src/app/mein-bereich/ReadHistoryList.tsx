'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './mein-bereich.module.css';

interface ReadPost {
  slug: string;
  title: string;
  category?: string;
  readAt: string;
}

interface Props {
  posts: ReadPost[];
  initialLimit?: number;
}

export default function ReadHistoryList({ posts, initialLimit = 10 }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? posts : posts.slice(0, initialLimit);
  const hasMore = posts.length > initialLimit;

  return (
    <>
      <ul className={styles.compactList}>
        {visible.map((post) => (
          <li key={post.slug} className={styles.compactItem}>
            <Link href={`/essays/${post.slug}`} className={styles.compactLink}>
              <span className={styles.compactTitle}>{post.title}</span>
              <span className={styles.compactMeta}>
                {post.category && <span>{post.category}</span>}
                <span>{post.readAt}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          className={styles.showMoreBtn}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Weniger anzeigen' : `Alle ${posts.length} anzeigen`}
        </button>
      )}
    </>
  );
}
