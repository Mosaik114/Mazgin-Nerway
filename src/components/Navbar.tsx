'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { buildSignInPath } from '@/lib/auth-redirect';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';

const publicLinks = [
  { href: '/', label: 'Start' },
  { href: '/essays', label: 'Essays' },
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
  const { data: session, status } = useSession();
  const menuId = 'mobile-navigation';
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && Boolean(session?.user);
  const currentUser = session?.user ?? null;
  const isAdmin = currentUser?.role === 'ADMIN';
  const displayName = currentUser?.name ?? currentUser?.email?.split('@')[0] ?? 'Konto';
  const signInHref = buildSignInPath(pathname || '/');

  const handleSignOut = () => {
    setOpen(false);
    void signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mobileNav = mobileNavRef.current;

    if (!open) {
      mobileNav?.setAttribute('inert', '');
      return;
    }

    mobileNav?.removeAttribute('inert');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 861px)');

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    query.addEventListener('change', handleViewportChange);
    return () => query.removeEventListener('change', handleViewportChange);
  }, []);

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
            src="/images/Mizgin Nerway Logo Gold.png"
            alt="Mizgin Nerway"
            width={512}
            height={124}
            priority
            className={styles.logoImage}
          />
        </Link>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {publicLinks.map(({ href, label }) => {
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
          {isLoading ? (
            <span className={styles.avatarSkeleton} />
          ) : isAuthenticated ? (
            <UserDropdown
              name={currentUser?.name}
              email={currentUser?.email}
              image={currentUser?.image}
              isAdmin={isAdmin}
            />
          ) : (
            <Link href={signInHref} className={styles.authButton} onClick={() => setOpen(false)}>
              Anmelden
            </Link>
          )}
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

      <div
        id={menuId}
        ref={mobileNavRef}
        className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ''}`}
        aria-hidden={!open}
      >
        {publicLinks.map(({ href, label }) => {
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

        {isAuthenticated && (
          <>
            <div className={styles.mobileUserHeader}>
              <span className={styles.mobileUserName}>{displayName}</span>
              {currentUser?.email && (
                <span className={styles.mobileUserEmail}>{currentUser.email}</span>
              )}
            </div>
            <Link
              href="/mein-bereich"
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              Mein Bereich
            </Link>
            <Link
              href="/einstellungen"
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              Einstellungen
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`${styles.mobileLink} ${isActiveLink(pathname, '/admin') ? styles.active : ''}`}
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}
          </>
        )}

        <div className={styles.mobileThemeRow}>
          <span className={styles.mobileThemeLabel}>Design</span>
          <ThemeToggle />
        </div>

        <div className={styles.mobileAuthRow}>
          {isLoading ? (
            <span className={styles.mobileAuthButton} style={{ opacity: 0.5 }}>Laden …</span>
          ) : isAuthenticated ? (
            <button type="button" className={styles.mobileAuthButton} onClick={handleSignOut}>
              Abmelden
            </button>
          ) : (
            <Link href={signInHref} className={styles.mobileAuthButton} onClick={() => setOpen(false)}>
              Anmelden mit Google
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
