'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',        label: 'Home'    },
  { href: '/blog',    label: 'Blog'    },
  { href: '/about',   label: 'About'   },
  { href: '/contact', label: 'Kontakt' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <Image src="/images/Mazgin Nerway Logo.png" alt="Mazgin Nerway" width={0} height={0} sizes="100vw" priority className={styles.logoImage} />
        </Link>

        {/* Desktop-Nav */}
        <nav className={styles.nav}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${pathname === href ? styles.active : ''}`}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü öffnen"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile-Nav */}
      <div className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ''}`}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.mobileLink} ${pathname === href ? styles.active : ''}`}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
        <div className={styles.mobileThemeRow}>
          <span className={styles.mobileThemeLabel}>Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
