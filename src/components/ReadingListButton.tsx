'use client';

import { useState } from 'react';
import styles from './ReadingListButton.module.css';

interface Props {
  essaySlug: string;
  initialOnList?: boolean;
  variant?: 'icon' | 'full';
}

export default function ReadingListButton({ essaySlug, initialOnList = false, variant = 'icon' }: Props) {
  const [onList, setOnList] = useState(initialOnList);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !onList;
    setOnList(next);
    setBusy(true);

    try {
      const res = await fetch(`/api/essays/${essaySlug}/interaction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isOnReadingList: next }),
      });
      if (!res.ok) setOnList(!next);
    } catch {
      setOnList(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${onList ? styles.active : ''} ${variant === 'full' ? styles.full : styles.iconOnly}`}
      onClick={toggle}
      aria-pressed={onList}
      aria-label={onList ? 'Von Leseliste entfernen' : 'Sp\u00e4ter lesen'}
      title={onList ? 'Von Leseliste entfernen' : 'Sp\u00e4ter lesen'}
      disabled={busy}
    >
      <svg
        className={styles.icon}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={onList ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {variant === 'full' && (
        <span className={styles.label}>{onList ? 'Auf Leseliste' : 'Sp\u00e4ter lesen'}</span>
      )}
    </button>
  );
}
