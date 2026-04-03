import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.ornament}><span>✦</span></div>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Diese Seite existiert nicht — oder noch nicht.</p>
      <Link href="/" className={styles.link}>← Zurück zur Startseite</Link>
    </div>
  );
}
