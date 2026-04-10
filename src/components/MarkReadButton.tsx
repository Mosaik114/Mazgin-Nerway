'use client';

import { useState, useEffect } from 'react';
import styles from './MarkReadButton.module.css';

interface Props {
  essaySlug: string;
  initialIsRead?: boolean;
  variant?: 'icon' | 'full';
}

export default function MarkReadButton({ essaySlug, initialIsRead = false, variant = 'icon' }: Props) {
  const [isRead, setIsRead] = useState(initialIsRead);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setIsRead(initialIsRead ?? false);
  }, [initialIsRead]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !isRead;
    setIsRead(next);
    setBusy(true);

    try {
      const res = await fetch(`/api/essays/${essaySlug}/interaction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isRead: next }),
      });
      if (!res.ok) setIsRead(!next);
    } catch {
      setIsRead(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${isRead ? styles.active : ''} ${variant === 'full' ? styles.full : styles.iconOnly}`}
      onClick={toggle}
      aria-pressed={isRead}
      aria-label={isRead ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
      title={isRead ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
      disabled={busy}
    >
      <svg
        className={`${styles.icon} ${isRead ? styles.iconActive : ''}`}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      {variant === 'full' && (
        <span className={styles.label}>{isRead ? 'Gelesen' : 'Als gelesen markieren'}</span>
      )}
    </button>
  );
}
