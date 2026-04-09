import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateDisplayNameAction, updateThemePreferenceAction } from './actions';
import AvatarUpload from './AvatarUpload';
import DeleteAccountForm from './DeleteAccountForm';
import styles from './einstellungen.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Einstellungen',
  robots: { index: false, follow: false },
};

export default async function EinstellungenPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=%2Feinstellungen');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      name: true,
      email: true,
      image: true,
      themePreference: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const currentDisplayName = user.displayName ?? '';
  const currentTheme = user.themePreference ?? '';
  const isAdmin = user.role === Role.ADMIN;

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link href="/mein-bereich" className={styles.backLink}>← Mein Bereich</Link>
        <h1 className={styles.title}>Einstellungen</h1>
      </div>

      {/* Profilbild */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Profilbild</h2>
        <p className={styles.cardDescription}>
          Lade ein eigenes Profilbild hoch. Erlaubt sind JPEG, PNG und WebP.
        </p>
        <AvatarUpload currentImage={user.image} name={user.displayName ?? user.name} />
      </div>

      {/* Anzeigename */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Anzeigename</h2>
        <p className={styles.cardDescription}>
          Wird in der Navigation und auf deinem Dashboard angezeigt. Leer lassen für den Google-Namen.
        </p>
        <form action={updateDisplayNameAction} className={styles.fieldRow}>
          <input
            type="text"
            name="displayName"
            defaultValue={currentDisplayName}
            placeholder={user.name ?? 'Dein Name'}
            maxLength={50}
            className={styles.input}
          />
          <button type="submit" className={styles.saveBtn}>Speichern</button>
        </form>
      </div>

      {/* Design-Präferenz */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Design</h2>
        <p className={styles.cardDescription}>
          Wähle dein bevorzugtes Design. Wird geräteübergreifend gespeichert.
        </p>
        <form action={updateThemePreferenceAction} className={styles.fieldRow}>
          <select name="theme" defaultValue={currentTheme} className={styles.select}>
            <option value="">Automatisch (Gerätestandard)</option>
            <option value="dark">Dunkel</option>
            <option value="light">Hell</option>
          </select>
          <button type="submit" className={styles.saveBtn}>Speichern</button>
        </form>
      </div>

      {/* Konto-Informationen */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Konto</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>E-Mail</span>
            <span className={styles.infoValue}>{user.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Rolle</span>
            <span className={styles.infoValue}>{user.role}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Mitglied seit</span>
            <span className={styles.infoValue}>
              {new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Gefahrenzone */}
      <div className={`${styles.card} ${styles.dangerCard}`}>
        <h2 className={styles.cardTitle}>Gefahrenzone</h2>
        <p className={styles.cardDescription}>
          Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich entfernt:
          Notizen, Favoriten und deine Leseliste.
        </p>
        <DeleteAccountForm
          userEmail={user.email ?? ''}
          isAdmin={isAdmin}
        />
      </div>
    </section>
  );
}
