import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import Link from 'next/link';
import { requireActivePageSession } from '@/lib/auth-page-guard';
import { isAdminEmail } from '@/lib/auth-policy';
import { prisma } from '@/lib/prisma';
import { setUserRoleAction, toggleUserBlockAction } from './actions';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function formatDateTime(value: Date | null): string {
  if (!value) {
    return 'Nie';
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function AdminPage() {
  const access = await requireActivePageSession('/admin');
  const isAdmin = isAdminEmail(access.user.email);

  if (!isAdmin) {
    return (
      <section className={`container ${styles.page}`}>
        <h1 className={styles.title}>Kein Zugriff</h1>
        <p className={styles.description}>Dieser Bereich ist nur für Admins freigeschaltet.</p>
        <Link href="/" className={styles.backLink}>Zurück zur Startseite</Link>
      </section>
    );
  }

  const [users, totalUsers, totalAdmins, totalBlocked] = await Promise.all([
    prisma.user.findMany({
      orderBy: [
        { lastLoginAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { isBlocked: true } }),
  ]);

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.description}>
          Eingeloggt als <strong>{access.user.email}</strong>.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Nutzer gesamt</span>
          <strong className={styles.statValue}>{totalUsers}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Admins</span>
          <strong className={styles.statValue}>{totalAdmins}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Gesperrt</span>
          <strong className={styles.statValue}>{totalBlocked}</strong>
        </article>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nutzer</th>
              <th>Rolle</th>
              <th>Status</th>
              <th>Erstellt</th>
              <th>Letzter Login</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentAdmin = access.user.id === user.id;
              const displayName = user.name ?? user.email ?? 'Unbekannt';

              return (
                <tr key={user.id}>
                  <td data-label="Nutzer">
                    <div className={styles.userCell}>
                      <strong>{displayName}</strong>
                      <span>{user.email ?? 'Keine E-Mail'}</span>
                    </div>
                  </td>
                  <td data-label="Rolle">{user.role}</td>
                  <td data-label="Status">
                    <span className={user.isBlocked ? styles.badgeDanger : styles.badgeOkay}>
                      {user.isBlocked ? 'Gesperrt' : 'Aktiv'}
                    </span>
                  </td>
                  <td data-label="Erstellt">{formatDateTime(user.createdAt)}</td>
                  <td data-label="Letzter Login">{formatDateTime(user.lastLoginAt)}</td>
                  <td data-label="Aktionen">
                    <div className={styles.actionGroup}>
                      <form action={setUserRoleAction} className={styles.inlineForm}>
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className={styles.select}
                          disabled={isCurrentAdmin}
                          aria-label={`Rolle für ${displayName}`}
                        >
                          <option value={Role.USER}>USER</option>
                          <option value={Role.ADMIN}>ADMIN</option>
                        </select>
                        <button type="submit" className={styles.actionButton} disabled={isCurrentAdmin}>
                          Rolle speichern
                        </button>
                      </form>

                      <form action={toggleUserBlockAction} className={styles.inlineForm}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="blocked" value={String(!user.isBlocked)} />
                        <button type="submit" className={styles.actionButton} disabled={isCurrentAdmin}>
                          {user.isBlocked ? 'Entsperren' : 'Sperren'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
