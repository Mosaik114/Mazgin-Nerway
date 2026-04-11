'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { BookOpenIcon, SettingsIcon, SignOutIcon } from './Icons';
import styles from './UserDropdown.module.css';
import ThemeToggle from './ThemeToggle';
import UserAvatar from './UserAvatar';

interface UserDropdownProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

export default function UserDropdown({ name, email, image, isAdmin }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = name ?? email?.split('@')[0] ?? 'Konto';

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function handleSignOut() {
    setOpen(false);
    void signOut({ callbackUrl: '/' });
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Benutzermen\u00fc \u00f6ffnen"
      >
        <UserAvatar image={image} name={displayName} size={36} />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.header}>
            <UserAvatar image={image} name={displayName} size={44} />
            <div className={styles.headerInfo}>
              <span className={styles.name}>{displayName}</span>
              {email && <span className={styles.email}>{email}</span>}
            </div>
          </div>

          <div className={styles.divider} />

          <nav className={styles.links}>
            <Link
              href="/mein-bereich"
              className={styles.menuItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <BookOpenIcon size={16} strokeWidth={1.5} />
              Mein Bereich
            </Link>
            <Link
              href="/einstellungen"
              className={styles.menuItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <SettingsIcon size={16} strokeWidth={1.5} />
              Einstellungen
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <SettingsIcon size={16} strokeWidth={1.5} />
                Admin
              </Link>
            )}
          </nav>

          <div className={styles.divider} />

          <div className={styles.themeRow}>
            <span className={styles.themeLabel}>Design</span>
            <ThemeToggle />
          </div>

          <div className={styles.divider} />

          <button
            type="button"
            className={styles.signOut}
            role="menuitem"
            onClick={handleSignOut}
          >
            <SignOutIcon size={16} strokeWidth={1.5} />
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}

