'use client';

import { useState, FormEvent } from 'react';
import styles from './contact.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(data: FormData) {
    const errs: Record<string, string> = {};
    if (!String(data.get('name')).trim()) errs.name = 'Bitte gib deinen Namen ein.';
    const email = String(data.get('email')).trim();
    if (!email) errs.email = 'Bitte gib deine E-Mail-Adresse ein.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Ungültige E-Mail-Adresse.';
    if (!String(data.get('message')).trim()) errs.message = 'Bitte schreib eine Nachricht.';
    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs = validate(data);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name')).trim(),
          email: String(data.get('email')).trim(),
          message: String(data.get('message')).trim(),
          website: String(data.get('website') ?? ''),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrors({ form: json.error ?? 'Etwas ist schiefgelaufen. Bitte versuch es erneut.' });
        setStatus('error');
        return;
      }

      setStatus('sent');
    } catch {
      setErrors({ form: 'Keine Verbindung. Bitte prüfe deine Internetverbindung.' });
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>✦</span>
        <h3>Nachricht erhalten</h3>
        <p>Danke — ich melde mich so bald wie möglich bei dir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* Honeypot — hidden from real users, traps bots */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input
          id="name"
          name="name"
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Dein Name"
          autoComplete="name"
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>E-Mail</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="deine@email.de"
          autoComplete="email"
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Nachricht</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          placeholder="Was liegt dir auf dem Herzen?"
        />
        {errors.message && <span className={styles.error}>{errors.message}</span>}
      </div>

      {errors.form && (
        <p className={styles.formError}>{errors.form}</p>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Wird gesendet…' : 'Nachricht senden →'}
      </button>
    </form>
  );
}
