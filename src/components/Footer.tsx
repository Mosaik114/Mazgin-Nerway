import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/config';
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
          <nav className={styles.social} aria-label="Social Media">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
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
