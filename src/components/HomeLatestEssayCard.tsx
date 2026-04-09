'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Essay } from '@/lib/essays';
import EssayCard from './EssayCard';
import styles from './HomeLatestEssayCard.module.css';

interface Interaction {
  isRead: boolean;
  isFavorite: boolean;
  isOnReadingList: boolean;
}

interface Props {
  post: Essay;
}

export default function HomeLatestEssayCard({ post }: Props) {
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
      <EssayCard
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
