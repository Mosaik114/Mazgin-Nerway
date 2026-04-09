'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './PostInteractionBar.module.css';

interface Interaction {
  isRead: boolean;
  note: string;
  isFavorite: boolean;
  isOnReadingList: boolean;
}

type State =
  | { kind: 'loading' }
  | { kind: 'unauthenticated' }
  | { kind: 'ready'; interaction: Interaction };

interface Props {
  postSlug: string;
}

export default function PostInteractionBar({ postSlug }: Props) {
  const pathname = usePathname();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [noteValue, setNoteValue] = useState('');
  const [noteChanged, setNoteChanged] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/posts/${postSlug}/interaction`, {
      cache: 'no-store',
      credentials: 'include',
    })
      .then((r) => (r.ok ? (r.json() as Promise<Interaction | null>) : null))
      .then((data) => {
        if (cancelled) return;
        if (data === null || data === undefined) {
          setState({ kind: 'unauthenticated' });
        } else {
          setState({ kind: 'ready', interaction: data });
          setNoteValue(data.note ?? '');
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'unauthenticated' });
      });

    return () => {
      cancelled = true;
    };
  }, [postSlug]);

  const patch = useCallback(
    async (updates: Partial<{ isRead: boolean; note: string; isFavorite: boolean; isOnReadingList: boolean }>) => {
      const res = await fetch(`/api/posts/${postSlug}/interaction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Fehler');
      return res.json() as Promise<Interaction>;
    },
    [postSlug],
  );

  const update = useCallback((interaction: Interaction) => {
    setState({ kind: 'ready', interaction });
  }, []);

  const toggleRead = async () => {
    if (state.kind !== 'ready') return;
    try {
      update(await patch({ isRead: !state.interaction.isRead }));
    } catch { /* silent */ }
  };

  const toggleFavorite = async () => {
    if (state.kind !== 'ready') return;
    try {
      update(await patch({ isFavorite: !state.interaction.isFavorite }));
    } catch { /* silent */ }
  };

  const toggleReadingList = async () => {
    if (state.kind !== 'ready') return;
    try {
      update(await patch({ isOnReadingList: !state.interaction.isOnReadingList }));
    } catch { /* silent */ }
  };

  const saveNote = async () => {
    setNoteSaving(true);
    try {
      update(await patch({ note: noteValue }));
      setNoteChanged(false);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch { /* silent */ }
    finally { setNoteSaving(false); }
  };

  if (state.kind === 'loading') return null;

  if (state.kind === 'unauthenticated') {
    const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname ?? '/')}`;
    return (
      <div className={styles.loginHint}>
        <p className={styles.loginHintText}>
          Melde dich an, um Notizen zu hinterlassen und Beiträge als gelesen zu markieren.
        </p>
        <Link href={signInHref} className={styles.loginHintLink}>
          Anmelden →
        </Link>
      </div>
    );
  }

  const { interaction } = state;

  return (
    <div className={styles.bar}>
      <h2 className={styles.barTitle}>Deine Lesemarkierungen</h2>

      <div className={styles.sections}>
        <div className={styles.section}>
          <button
            type="button"
            className={`${styles.readBtn} ${interaction.isRead ? styles.readBtnActive : ''}`}
            onClick={toggleRead}
            aria-pressed={interaction.isRead}
          >
            <span className={styles.readIcon} aria-hidden="true">
              {interaction.isRead ? '✓' : '○'}
            </span>
            {interaction.isRead ? 'Gelesen' : 'Als gelesen markieren'}
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.quickActions}>
            <button
              type="button"
              className={`${styles.favoriteBtn} ${interaction.isFavorite ? styles.favoriteBtnActive : ''}`}
              onClick={toggleFavorite}
              aria-pressed={interaction.isFavorite}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={interaction.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {interaction.isFavorite ? 'Favorisiert' : 'Favorit'}
            </button>
            <button
              type="button"
              className={`${styles.readingListBtn} ${interaction.isOnReadingList ? styles.readingListBtnActive : ''}`}
              onClick={toggleReadingList}
              aria-pressed={interaction.isOnReadingList}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={interaction.isOnReadingList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {interaction.isOnReadingList ? 'Auf Leseliste' : 'Später lesen'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label htmlFor={`note-${postSlug}`} className={styles.sectionLabel}>
            Meine Notiz
          </label>
          <textarea
            id={`note-${postSlug}`}
            className={styles.noteTextarea}
            value={noteValue}
            onChange={(e) => {
              setNoteValue(e.target.value);
              setNoteChanged(true);
              setNoteSaved(false);
            }}
            placeholder="Schreibe dir hier eine persönliche Notiz zu diesem Beitrag …"
            rows={4}
            maxLength={5000}
          />
          <div className={styles.noteFooter}>
            <span className={styles.charCount}>{noteValue.length} / 5000</span>
            <button
              type="button"
              className={`${styles.saveBtn} ${noteSaved ? styles.saveBtnSaved : ''}`}
              onClick={saveNote}
              disabled={noteSaving || !noteChanged}
            >
              {noteSaving ? 'Speichern …' : noteSaved ? 'Gespeichert ✓' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
