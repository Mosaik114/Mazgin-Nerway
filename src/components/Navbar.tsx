'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';

const publicLinks = [
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
  const { data: session, status } = useSession();
  const [fallbackUser, setFallbackUser] = useState<{
    name?: string | null;
    email?: string | null;
    role?: 'USER' | 'ADMIN';
  } | null>(null);
  const menuId = 'mobile-navigation';
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const currentUser = session?.user ?? fallbackUser;
  const isAuthenticated = status === 'authenticated' ? Boolean(session?.user) : Boolean(currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';
  const visibleLinks = isAdmin ? [...publicLinks, { href: '/admin', label: 'Admin' }] : publicLinks;
  const displayName = currentUser?.name ?? currentUser?.email?.split('@')[0] ?? 'Konto';
  const signInHref = `/api/auth/signin?callbackUrl=${encodeURIComponent(pathname || '/')}`;

  const handleSignOut = () => {
    setOpen(false);
    void signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let active = true;

    if (session?.user) {
      setFallbackUser(null);
      return () => {
        active = false;
      };
    }

    const fetchFallbackSession = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          user?: {
            name?: string | null;
            email?: string | null;
            role?: 'USER' | 'ADMIN';
          } | null;
        };

        if (active) {
          setFallbackUser(data.user ?? null);
        }
      } catch {
        if (active) {
          setFallbackUser(null);
        }
      }
    };

    void fetchFallbackSession();

    return () => {
      active = false;
    };
  }, [pathname, session?.user]);

  useEffect(() => {
    const mobileNav = mobileNavRef.current;
    if (!mobileNav) return;

    if (open) {
      mobileNav.removeAttribute('inert');
      return;
    }

    mobileNav.setAttribute('inert', '');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 861px)');

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    query.addEventListener('change', handleViewportChange);
    return () => query.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;

    style.overflow = 'hidden';

    return () => {
      style.overflow = previousOverflow;
    };
  }, [open]);

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
            src="/images/Mazgin Nerway Logo Gold.png"
            alt="Mazgin Nerway"
            width={512}
            height={124}
            priority
            className={styles.logoImage}
          />
        </Link>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {visibleLinks.map(({ href, label }) => {
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
          {isAuthenticated ? (
            <div className={styles.authRow}>
              <span className={styles.userBadge} title={currentUser?.email ?? undefined}>
                {displayName}
              </span>
              <button type="button" className={styles.authButton} onClick={handleSignOut}>
                Abmelden
              </button>
            </div>
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
        {visibleLinks.map(({ href, label }) => {
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
        <div className={styles.mobileAuthRow}>
          {isAuthenticated && (
            <span className={styles.mobileUserBadge} title={currentUser?.email ?? undefined}>
              {displayName}
            </span>
          )}
          {isAuthenticated ? (
            <button type="button" className={styles.mobileAuthButton} onClick={handleSignOut}>
              Abmelden
            </button>
          ) : (
            <Link href={signInHref} className={styles.mobileAuthButton} onClick={() => setOpen(false)}>
              Anmelden mit Google
            </Link>
          )}
        </div>
        <div className={styles.mobileThemeRow}>
          <span className={styles.mobileThemeLabel}>Design</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
