'use client';

import { useState } from 'react';
import { deleteAccountAction } from './actions';
import styles from './einstellungen.module.css';

interface Props {
  userEmail: string;
  isAdmin: boolean;
}

function isRedirectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeDigest = (error as { digest?: unknown }).digest;
  return typeof maybeDigest === 'string' && maybeDigest.startsWith('NEXT_REDIRECT');
}

export default function DeleteAccountForm({ userEmail, isAdmin }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');

  if (isAdmin) {
    return (
      <p className={styles.dangerNote}>
        Admin-Konten können nicht über die Einstellungen gelöscht werden.
      </p>
    );
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        className={styles.dangerBtn}
        onClick={() => setShowConfirm(true)}
      >
        Konto und alle Daten löschen
      </button>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError('');
    try {
      await deleteAccountAction(formData);
    } catch (e) {
      if (isRedirectError(e)) {
        throw e;
      }

      setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten');
    }
  }

  return (
    <div className={styles.confirmBox}>
      <p className={styles.confirmText}>
        Gib deine E-Mail-Adresse <strong>{userEmail}</strong> ein, um die Löschung zu bestätigen.
        Alle deine Daten werden unwiderruflich gelöscht.
      </p>
      <form action={handleSubmit} className={styles.confirmForm}>
        <input
          type="email"
          name="confirmEmail"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={userEmail}
          className={styles.input}
          autoComplete="off"
        />
        {error && <p className={styles.errorText}>{error}</p>}
        <div className={styles.confirmActions}>
          <button
            type="submit"
            className={styles.dangerBtn}
            disabled={confirmEmail.toLowerCase() !== userEmail.toLowerCase()}
          >
            Endgültig löschen
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              setShowConfirm(false);
              setConfirmEmail('');
              setError('');
            }}
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
