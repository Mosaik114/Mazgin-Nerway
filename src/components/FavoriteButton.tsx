'use client';

import { useState, useEffect } from 'react';
import styles from './FavoriteButton.module.css';

interface Props {
  essaySlug: string;
  initialFavorite?: boolean;
  variant?: 'icon' | 'full';
}

export default function FavoriteButton({ essaySlug, initialFavorite = false, variant = 'icon' }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setIsFavorite(initialFavorite ?? false);
  }, [initialFavorite]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !isFavorite;
    setIsFavorite(next);
    setBusy(true);

    try {
      const res = await fetch(`/api/essays/${essaySlug}/interaction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) setIsFavorite(!next);
    } catch {
      setIsFavorite(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${isFavorite ? styles.active : ''} ${variant === 'full' ? styles.full : styles.iconOnly}`}
      onClick={toggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzuf\u00fcgen'}
      title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzuf\u00fcgen'}
      disabled={busy}
    >
      <svg
        className={`${styles.heart} ${isFavorite ? styles.heartActive : ''}`}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {variant === 'full' && (
        <span className={styles.label}>{isFavorite ? 'Favorisiert' : 'Favorit'}</span>
      )}
    </button>
  );
}
