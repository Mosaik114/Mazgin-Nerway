'use client';

import { useInteractionToggle } from './useInteractionToggle';
import { HeartIcon } from './Icons';
import styles from './FavoriteButton.module.css';

interface Props {
  essaySlug: string;
  initialFavorite?: boolean;
  variant?: 'icon' | 'full';
}

export default function FavoriteButton({ essaySlug, initialFavorite = false, variant = 'icon' }: Props) {
  const { active, busy, toggle } = useInteractionToggle({
    essaySlug,
    field: 'isFavorite',
    initialValue: initialFavorite,
  });

  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.active : ''} ${variant === 'full' ? styles.full : styles.iconOnly}`}
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      title={active ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      disabled={busy}
    >
      <HeartIcon
        filled={active}
        size={15}
        className={`${styles.heart} ${active ? styles.heartActive : ''}`}
      />
      {variant === 'full' && (
        <span className={styles.label}>{active ? 'Favorisiert' : 'Favorit'}</span>
      )}
    </button>
  );
}
