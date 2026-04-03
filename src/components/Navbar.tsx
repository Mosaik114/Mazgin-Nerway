'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';

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
          Mazgin<span>.</span>
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
      </div>
    </header>
  );
}
