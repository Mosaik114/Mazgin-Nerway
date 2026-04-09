'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './PostInteractionBar.module.css';

interface Interaction {
  isRead: boolean;
  bookmarkPercent: number | null;
  note: string;
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
    async (updates: Partial<{ isRead: boolean; bookmarkPercent: number | null; note: string }>) => {
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

  const setBookmark = async () => {
    const scrollable = document.body.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 0;
    try {
      update(await patch({ bookmarkPercent: percent }));
    } catch { /* silent */ }
  };

  const clearBookmark = async () => {
    try {
      update(await patch({ bookmarkPercent: null }));
    } catch { /* silent */ }
  };

  const jumpToBookmark = () => {
    if (state.kind !== 'ready' || state.interaction.bookmarkPercent == null) return;
    const scrollable = document.body.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (scrollable * state.interaction.bookmarkPercent) / 100, behavior: 'smooth' });
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
          Melde dich an, um Notizen zu hinterlassen, Beiträge als gelesen zu markieren und Lesezeichen zu setzen.
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
          <p className={styles.sectionLabel}>Lesezeichen</p>
          <div className={styles.bookmarkRow}>
            <button type="button" className={styles.bookmarkBtn} onClick={setBookmark}>
              Lesezeichen hier setzen
            </button>
            {interaction.bookmarkPercent !== null && (
              <>
                <button type="button" className={styles.jumpBtn} onClick={jumpToBookmark}>
                  Zum Lesezeichen springen · {interaction.bookmarkPercent}%
                </button>
                <button
                  type="button"
                  className={styles.clearBookmarkBtn}
                  onClick={clearBookmark}
                  aria-label="Lesezeichen entfernen"
                  title="Lesezeichen entfernen"
                >
                  ×
                </button>
              </>
            )}
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
