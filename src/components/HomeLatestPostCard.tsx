'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Post } from '@/lib/posts';
import BlogCard from './BlogCard';
import styles from './HomeLatestPostCard.module.css';

interface Interaction {
  isRead: boolean;
  isFavorite: boolean;
  isOnReadingList: boolean;
}

interface Props {
  post: Post;
}

export default function HomeLatestPostCard({ post }: Props) {
  const { status } = useSession();
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated) {
      setInteraction(null);
      return;
    }

    let cancelled = false;

    void fetch(`/api/posts/${post.slug}/interaction`, {
      cache: 'no-store',
      credentials: 'include',
    })
      .then((response) => (response.ok ? (response.json() as Promise<Interaction | null>) : null))
      .then((data) => {
        if (!cancelled && data) {
          setInteraction(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, post.slug]);

  return (
    <>
      <BlogCard
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
        showActions={isAuthenticated}
      />
      {!isAuthenticated && (
        <p className={styles.loginHint}>
          Favoriten und Spaeter-lesen sind nach dem Login verfuegbar.
        </p>
      )}
    </>
  );
}
