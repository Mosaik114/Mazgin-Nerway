'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buildSignInPath } from '@/lib/auth-redirect';
import useSWR from 'swr';
import styles from './EssayInteractionBar.module.css';

interface Interaction {
  isRead: boolean;
  note: string;
  isFavorite: boolean;
  isOnReadingList: boolean;
}

interface Props {
  essaySlug: string;
}

const EMPTY_INTERACTION: Interaction = {
  isRead: false,
  note: '',
  isFavorite: false,
  isOnReadingList: false,
};

const NOTE_DEBOUNCE_MS = 1100;

const fetcher = (url: string): Promise<Interaction | null> =>
  fetch(url, { cache: 'no-store', credentials: 'include' })
    .then((r) => (r.ok ? (r.json() as Promise<Interaction | null>) : null))
    .catch(() => null);

export default function EssayInteractionBar({ essaySlug }: Props) {
  const pathname = usePathname();
  const signInHref = buildSignInPath(pathname ?? '/');

  const { data, isLoading, mutate } = useSWR<Interaction | null>(
    `/api/essays/${essaySlug}/interaction`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const [noteValue, setNoteValue] = useState('');
  const [savedNoteValue, setSavedNoteValue] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteSaveError, setNoteSaveError] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const initializedSlugRef = useRef<string | null>(null);

  // Sync note state when data first arrives for this slug
  useEffect(() => {
    if (data && initializedSlugRef.current !== essaySlug) {
      initializedSlugRef.current = essaySlug;
      const note = data.note ?? '';
      setNoteValue(note);
      setSavedNoteValue(note);
      setNoteSaved(false);
      setNoteSaveError(false);
    }
  }, [data, essaySlug]);

  const isUnauthenticated = !isLoading && data === null;
  const interaction = data ?? EMPTY_INTERACTION;
  const actionsDisabled = isLoading || isUnauthenticated;
  const noteChanged = noteValue !== savedNoteValue;

  const patch = useCallback(
    async (updates: Partial<Interaction>): Promise<Interaction> => {
      const res = await fetch(`/api/essays/${essaySlug}/interaction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('interaction patch failed');
      return res.json() as Promise<Interaction>;
    },
    [essaySlug],
  );

  const optimisticToggle = useCallback(
    (updates: Partial<Pick<Interaction, 'isRead' | 'isFavorite' | 'isOnReadingList'>>) => {
      if (!data) return;
      void mutate(async () => patch(updates), {
        optimisticData: { ...data, ...updates },
        rollbackOnError: true,
        revalidate: false,
      });
    },
    [data, mutate, patch],
  );

  const toggleRead = () => optimisticToggle({ isRead: !interaction.isRead });
  const toggleFavorite = () => optimisticToggle({ isFavorite: !interaction.isFavorite });
  const toggleReadingList = () => optimisticToggle({ isOnReadingList: !interaction.isOnReadingList });

  const persistNote = useCallback(
    async (value: string, source: 'auto' | 'manual') => {
      if (!data || noteSaving || value === savedNoteValue) return;

      setNoteSaving(true);
      try {
        const next = await patch({ note: value });
        await mutate(next, { revalidate: false });
        setSavedNoteValue(next.note ?? '');
        setNoteSaveError(false);
        if (source === 'manual' || value === noteValue) {
          setNoteSaved(true);
        }
      } catch {
        if (source === 'manual') setNoteSaveError(true);
      } finally {
        setNoteSaving(false);
      }
    },
    [data, noteSaving, savedNoteValue, patch, mutate, noteValue],
  );

  useEffect(() => {
    if (!noteSaved) return;
    const timer = window.setTimeout(() => setNoteSaved(false), 2200);
    return () => window.clearTimeout(timer);
  }, [noteSaved]);

  useEffect(() => {
    if (!noteOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNoteOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [noteOpen]);

  useEffect(() => {
    if (!data || !noteChanged || noteSaving) return;

    const valueToSave = noteValue;
    const timer = window.setTimeout(() => {
      void persistNote(valueToSave, 'auto');
    }, NOTE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [data, noteChanged, noteSaving, noteValue, persistNote]);

  const noteStatus = noteSaving
    ? 'Speichert ...'
    : noteSaveError
      ? 'Speichern fehlgeschlagen'
      : noteSaved
        ? 'Gespeichert'
        : noteChanged
          ? 'Ungespeichert'
          : 'Alles gespeichert';

  return (
    <>
      <div className={styles.host}>
        <div className={styles.actions} role="group" aria-label="Deine Lesemarkierungen">
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.readBtn} ${interaction.isRead ? styles.readBtnActive : ''}`}
            onClick={toggleRead}
            aria-pressed={interaction.isRead}
            aria-label={interaction.isRead ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
            title={interaction.isRead ? 'Gelesen' : 'Als gelesen markieren'}
            disabled={actionsDisabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.favoriteBtn} ${interaction.isFavorite ? styles.favoriteBtnActive : ''}`}
            onClick={toggleFavorite}
            aria-pressed={interaction.isFavorite}
            aria-label={interaction.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            title={interaction.isFavorite ? 'Favorisiert' : 'Favorit'}
            disabled={actionsDisabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={interaction.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.readingListBtn} ${interaction.isOnReadingList ? styles.readingListBtnActive : ''}`}
            onClick={toggleReadingList}
            aria-pressed={interaction.isOnReadingList}
            aria-label={interaction.isOnReadingList ? 'Von Leseliste entfernen' : 'Zur Leseliste hinzufügen'}
            title={interaction.isOnReadingList ? 'Auf Leseliste' : 'Später lesen'}
            disabled={actionsDisabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={interaction.isOnReadingList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {isUnauthenticated && (
          <p className={styles.loginHint}>
            Für Markierungen und Notizen&nbsp;
            <Link href={signInHref} className={styles.loginHintLink}>
              anmelden
            </Link>
            .
          </p>
        )}
      </div>

      <button
        type="button"
        className={`${styles.noteFab} ${noteOpen ? styles.noteFabOpen : ''}`}
        onClick={() => setNoteOpen((open) => !open)}
        aria-expanded={noteOpen}
        aria-controls={`note-popup-${essaySlug}`}
        aria-label={noteOpen ? 'Notiz schließen' : 'Notiz öffnen'}
        title={data ? 'Notiz öffnen' : 'Notiz (Login erforderlich)'}
        disabled={actionsDisabled}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
        <span className={styles.noteFabLabel}>Notiz</span>
      </button>

      {noteOpen && data && (
        <section
          id={`note-popup-${essaySlug}`}
          className={styles.notePopup}
          role="dialog"
          aria-modal="false"
          aria-label="Meine Notiz"
        >
          <div className={styles.noteHeader}>
            <p className={styles.noteTitle}>Meine Notiz</p>
            <button
              type="button"
              className={styles.noteClose}
              onClick={() => setNoteOpen(false)}
              aria-label="Notiz schließen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <textarea
            id={`note-${essaySlug}`}
            className={styles.noteTextarea}
            value={noteValue}
            onChange={(event) => {
              setNoteValue(event.target.value);
              setNoteSaved(false);
              setNoteSaveError(false);
            }}
            placeholder="Schreibe dir hier eine persönliche Notiz zu diesem Essay ..."
            rows={6}
            maxLength={5000}
          />

          <div className={styles.noteFooter}>
            <span className={styles.charCount}>{noteValue.length} / 5000</span>
            <span className={`${styles.noteStatus} ${noteSaveError ? styles.noteStatusError : ''}`}>
              {noteStatus}
            </span>
            <button
              type="button"
              className={`${styles.saveBtn} ${noteSaved ? styles.saveBtnSaved : ''}`}
              onClick={() => void persistNote(noteValue, 'manual')}
              disabled={noteSaving || !noteChanged}
            >
              {noteSaving ? 'Speichern ...' : noteSaved ? 'Gespeichert' : 'Speichern'}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
