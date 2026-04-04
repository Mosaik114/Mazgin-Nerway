'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Start' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'Über mich' },
  { href: '/contact', label: 'Kontakt' },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = 'mobile-navigation';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link
          href="/"
          className={styles.logo}
          onClick={() => setOpen(false)}
          aria-label="Zur Startseite"
        >
          <Image
            src="/images/Mazgin Nerway Logo.png"
            alt="Mazgin Nerway"
            width={50}
            height={50}
            priority
            className={styles.logoImage}
          />
        </Link>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {links.map(({ href, label }) => {
            const isActive = isActiveLink(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        <button
          type="button"
          className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={open}
          aria-controls={menuId}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id={menuId} className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ''}`}>
        {links.map(({ href, label }) => {
          const isActive = isActiveLink(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.mobileLink} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          );
        })}
        <div className={styles.mobileThemeRow}>
          <span className={styles.mobileThemeLabel}>Design</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
