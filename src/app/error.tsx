'use client';

import Link from 'next/link';
import styles from './error.module.css';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.ornament}><span>✦</span></div>
      <h2 className={styles.title}>Etwas ist schiefgelaufen</h2>
      <p className={styles.text}>
        Ein unerwarteter Fehler ist aufgetreten. Du kannst es erneut versuchen
        oder zur Startseite zurückkehren.
      </p>
      <div className={styles.actions}>
        <button onClick={reset} className={styles.btn}>Erneut versuchen</button>
        <Link href="/" className={styles.link}>← Zur Startseite</Link>
      </div>
    </div>
  );
}
