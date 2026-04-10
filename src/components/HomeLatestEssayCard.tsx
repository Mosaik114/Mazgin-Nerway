'use client';

import { useSession } from 'next-auth/react';
import type { Essay } from '@/lib/essays';
import { useInteractions } from './InteractionsProvider';
import EssayCard from './EssayCard';
import styles from './HomeLatestEssayCard.module.css';

interface Props {
  post: Essay;
  showLoginHint?: boolean;
}

export default function HomeLatestEssayCard({ post, showLoginHint = true }: Props) {
  const { status } = useSession();
  const interactions = useInteractions();
  const isAuthenticated = status === 'authenticated';
  const interaction = interactions.get(post.slug);

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
      {!isAuthenticated && showLoginHint && (
        <p className={styles.loginHint}>
          Favoriten und Spaeter-lesen sind nach dem Login verfuegbar.
        </p>
      )}
    </>
  );
}
