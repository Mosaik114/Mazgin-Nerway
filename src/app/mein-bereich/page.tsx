import type { Metadata } from 'next';
import Link from 'next/link';
import { requireActivePageSession } from '@/lib/auth-page-guard';
import { prisma } from '@/lib/prisma';
import { getAllEssays } from '@/lib/essays';
import { formatDate } from '@/lib/config';
import { BookReadIcon, FileTextIcon, HeartIcon, SettingsIcon } from '@/components/Icons';
import UserAvatar from '@/components/UserAvatar';
import { removeFromReadingListAction, removeFavoriteAction } from './actions';
import ReadHistoryList from './ReadHistoryList';
import styles from './mein-bereich.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mein Bereich',
  robots: { index: false, follow: false },
};

export default async function MeinBereichPage() {
  const access = await requireActivePageSession('/mein-bereich');

  const [readingList, favorites, withNotesRaw, readPosts, user] = await Promise.all([
    prisma.userEssayInteraction.findMany({
      where: { userId: access.user.id, isOnReadingList: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.userEssayInteraction.findMany({
      where: { userId: access.user.id, isFavorite: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.userEssayInteraction.findMany({
      where: { userId: access.user.id, note: { not: null } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.userEssayInteraction.findMany({
      where: { userId: access.user.id, isRead: true, readAt: { not: null } },
      orderBy: { readAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: access.user.id },
      select: { displayName: true, name: true, email: true, image: true },
    }),
  ]);

  const withNotes = withNotesRaw.filter((i) => i.note && i.note.trim().length > 0);

  const allEssays = getAllEssays();
  const postMap = new Map(allEssays.map((e) => [e.slug, e]));

  const displayName = user?.displayName ?? user?.name ?? access.user.email?.split('@')[0] ?? 'dort';

  const totalRead = readPosts.length;
  const totalFavorites = favorites.length;
  const totalNotes = withNotes.length;

  return (
    <section className={`container ${styles.page}`}>
      {/* Profil-Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <UserAvatar image={user?.image} name={displayName} size={72} />
          <div className={styles.profileText}>
            <h1 className={styles.title}>Moin, {displayName}</h1>
            {user?.email && <p className={styles.profileEmail}>{user.email}</p>}
          </div>
        </div>
        <Link href="/einstellungen" className={styles.settingsBtn}>
          <SettingsIcon size={16} strokeWidth={1.5} />
          Einstellungen
        </Link>
      </div>

      {/* Schnellstatistiken */}
      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">
            <BookReadIcon size={18} strokeWidth={1.5} />
          </span>
          <div className={styles.statContent}>
            <strong className={styles.statValue}>{totalRead}</strong>
            <span className={styles.statLabel}>Gelesen</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">
            <HeartIcon size={18} strokeWidth={1.5} />
          </span>
          <div className={styles.statContent}>
            <strong className={styles.statValue}>{totalFavorites}</strong>
            <span className={styles.statLabel}>Favoriten</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">
            <FileTextIcon size={18} strokeWidth={1.5} />
          </span>
          <div className={styles.statContent}>
            <strong className={styles.statValue}>{totalNotes}</strong>
            <span className={styles.statLabel}>Notizen</span>
          </div>
        </article>
      </div>

      {/* Leseliste */}
      <div className={styles.sectionBlock} id="leseliste">
        <h2 className={styles.sectionTitle}>Leseliste</h2>
        {readingList.length === 0 ? (
          <p className={styles.emptyText}>
            Deine Leseliste ist leer.{' '}
            <Link href="/essays" className={styles.inlineLink}>Entdecke neue Essays</Link>
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {readingList.map((item) => {
              const post = postMap.get(item.essaySlug);
              if (!post) return null;
              return (
                <div key={item.essaySlug} className={styles.miniCard}>
                  <Link href={`/essays/${post.slug}`} className={styles.miniCardLink}>
                    <span className={styles.miniCardTitle}>{post.title}</span>
                    <span className={styles.miniCardMeta}>
                      {post.category && <span>{post.category}</span>}
                      <span>{post.readingTime} Min.</span>
                    </span>
                  </Link>
                  <form action={removeFromReadingListAction}>
                    <input type="hidden" name="essaySlug" value={item.essaySlug} />
                    <button type="submit" className={styles.removeBtn} title="Von Leseliste entfernen">
                      ×
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Favoriten */}
      <div className={styles.sectionBlock} id="favoriten">
        <h2 className={styles.sectionTitle}>Favoriten</h2>
        {favorites.length === 0 ? (
          <p className={styles.emptyText}>
            Noch keine Favoriten.{' '}
            <Link href="/essays" className={styles.inlineLink}>Stöbere in den Essays</Link>
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {favorites.map((item) => {
              const post = postMap.get(item.essaySlug);
              if (!post) return null;
              return (
                <div key={item.essaySlug} className={styles.miniCard}>
                  <Link href={`/essays/${post.slug}`} className={styles.miniCardLink}>
                    <span className={styles.miniCardTitle}>{post.title}</span>
                    <span className={styles.miniCardMeta}>
                      {post.category && <span>{post.category}</span>}
                    </span>
                  </Link>
                  <form action={removeFavoriteAction}>
                    <input type="hidden" name="essaySlug" value={item.essaySlug} />
                    <button type="submit" className={styles.removeBtn} title="Aus Favoriten entfernen">
                      ×
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notizen */}
      <div className={styles.sectionBlock} id="notizen">
        <h2 className={styles.sectionTitle}>Notizen</h2>
        {withNotes.length === 0 ? (
          <p className={styles.emptyText}>
            Noch keine Notizen vorhanden.
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {withNotes.map((item) => {
              const post = postMap.get(item.essaySlug);
              if (!post) return null;
              return (
                <div key={item.essaySlug} className={styles.noteCard}>
                  <div className={styles.noteCardHeader}>
                    <Link href={`/essays/${post.slug}`} className={styles.miniCardTitle}>
                      {post.title}
                    </Link>
                  </div>
                  {item.note && item.note.trim() && (
                    <p className={styles.notePreview}>
                      {item.note.slice(0, 150)}
                      {item.note.length > 150 ? ' …' : ''}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gelesene Beiträge */}
      <div className={styles.sectionBlock} id="gelesen">
        <h2 className={styles.sectionTitle}>Gelesene Essays</h2>
        {readPosts.length === 0 ? (
          <p className={styles.emptyText}>
            Noch nichts gelesen.{' '}
            <Link href="/essays" className={styles.inlineLink}>Fang jetzt an</Link>
          </p>
        ) : (
          <ReadHistoryList
            posts={readPosts
              .map((item) => {
                const post = postMap.get(item.essaySlug);
                if (!post) return null;
                return {
                  slug: post.slug,
                  title: post.title,
                  category: post.category,
                  readAt: item.readAt ? formatDate(item.readAt.toISOString()) : '',
                };
              })
              .filter((p): p is NonNullable<typeof p> => p !== null)}
          />
        )}
      </div>

    </section>
  );
}
