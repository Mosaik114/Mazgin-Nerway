'use client';

import { useInteractionToggle } from './useInteractionToggle';
import { BookmarkIcon } from './Icons';
import styles from './ReadingListButton.module.css';

interface Props {
  essaySlug: string;
  initialOnList?: boolean;
  variant?: 'icon' | 'full';
}

export default function ReadingListButton({ essaySlug, initialOnList = false, variant = 'icon' }: Props) {
  const { active, busy, toggle } = useInteractionToggle({
    essaySlug,
    field: 'isOnReadingList',
    initialValue: initialOnList,
  });

  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.active : ''} ${variant === 'full' ? styles.full : styles.iconOnly}`}
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? 'Von Leseliste entfernen' : 'Später lesen'}
      title={active ? 'Von Leseliste entfernen' : 'Später lesen'}
      disabled={busy}
    >
      <BookmarkIcon filled={active} size={15} className={styles.icon} />
      {variant === 'full' && (
        <span className={styles.label}>{active ? 'Auf Leseliste' : 'Später lesen'}</span>
      )}
    </button>
  );
}
