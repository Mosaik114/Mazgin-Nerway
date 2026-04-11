'use client';

import { useInteractionToggle } from './useInteractionToggle';
import { CheckCircleIcon } from './Icons';
import styles from './MarkReadButton.module.css';

interface Props {
  essaySlug: string;
  initialIsRead?: boolean;
  variant?: 'icon' | 'full';
}

export default function MarkReadButton({ essaySlug, initialIsRead = false, variant = 'icon' }: Props) {
  const { active, busy, toggle } = useInteractionToggle({
    essaySlug,
    field: 'isRead',
    initialValue: initialIsRead,
  });

  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.active : ''} ${variant === 'full' ? styles.full : styles.iconOnly}`}
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
      title={active ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
      disabled={busy}
    >
      <CheckCircleIcon size={15} className={`${styles.icon} ${active ? styles.iconActive : ''}`} />
      {variant === 'full' && (
        <span className={styles.label}>{active ? 'Gelesen' : 'Als gelesen markieren'}</span>
      )}
    </button>
  );
}
