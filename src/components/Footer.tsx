import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.ornamentLine}>
          <span className={styles.ornamentSymbol}>✦</span>
        </div>

        <div className={styles.content}>
          <p className={styles.name}>Mazgin Nerway</p>
          <nav className={styles.links}>
            <Link href="/">Start</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">Über mich</Link>
            <Link href="/contact">Kontakt</Link>
          </nav>
          <div className={styles.legal}>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
          <p className={styles.copy}>
            © {new Date().getFullYear()} Mazgin Nerway. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
