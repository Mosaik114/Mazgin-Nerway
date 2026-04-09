import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/config';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.ornamentLine} />

        <div className={styles.content}>
          <div className={styles.brandCol}>
            <p className={styles.name}>Mazgin Nerway</p>
            <p className={styles.copy}>
              © {new Date().getFullYear()} Mazgin Nerway. Alle Rechte vorbehalten.
            </p>
          </div>

          <nav className={styles.links} aria-label="Seiten">
            <Link href="/">Start</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">Über mich</Link>
            <Link href="/contact">Kontakt</Link>
          </nav>

          <div className={styles.metaCol}>
            <nav className={styles.social} aria-label="Social Media">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </nav>
            <div className={styles.legal}>
              <Link href="/impressum">Impressum</Link>
              <Link href="/datenschutz">Datenschutz</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
