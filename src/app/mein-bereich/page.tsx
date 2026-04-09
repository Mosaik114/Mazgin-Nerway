import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/config';
import { removeFromReadingListAction, removeFavoriteAction, clearBookmarkAction } from './actions';
import ReadHistoryList from './ReadHistoryList';
import styles from './mein-bereich.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mein Bereich',
  robots: { index: false, follow: false },
};

export default async function MeinBereichPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=%2Fmein-bereich');
  }

  const [interactions, user] = await Promise.all([
    prisma.userPostInteraction.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { displayName: true, name: true },
    }),
  ]);

  const allPosts = getAllPosts();
  const postMap = new Map(allPosts.map((p) => [p.slug, p]));

  const displayName = user?.displayName ?? user?.name ?? session.user.email?.split('@')[0] ?? 'dort';

  // Daten gruppieren
  const readingList = interactions.filter((i) => i.isOnReadingList);
  const favorites = interactions.filter((i) => i.isFavorite);
  const bookmarked = interactions.filter((i) => i.bookmarkPercent !== null);
  const withNotes = interactions.filter((i) => i.note && i.note.trim().length > 0);
  const readPosts = interactions
    .filter((i) => i.isRead && i.readAt)
    .sort((a, b) => (b.readAt?.getTime() ?? 0) - (a.readAt?.getTime() ?? 0));

  // Weiterlesen: neuester Post mit Lesezeichen
  const continueReading = bookmarked[0] ?? null;
  const continuePost = continueReading ? postMap.get(continueReading.postSlug) : null;

  const totalRead = readPosts.length;
  const totalFavorites = favorites.length;
  const totalNotes = withNotes.length;

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hallo, {displayName}</h1>
        <p className={styles.subtitle}>Dein persönlicher Lesebereich.</p>
      </div>

      {/* Schnellstatistiken */}
      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Gelesen</span>
          <strong className={styles.statValue}>{totalRead}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Favoriten</span>
          <strong className={styles.statValue}>{totalFavorites}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Notizen</span>
          <strong className={styles.statValue}>{totalNotes}</strong>
        </article>
      </div>

      {/* Weiterlesen */}
      {continuePost && continueReading && (
        <div className={styles.sectionBlock} id="weiterlesen">
          <h2 className={styles.sectionTitle}>Weiterlesen</h2>
          <div className={styles.continueCard}>
            <div className={styles.continueInfo}>
              <Link href={`/blog/${continuePost.slug}`} className={styles.continueTitle}>
                {continuePost.title}
              </Link>
              {continuePost.category && (
                <span className={styles.continueMeta}>{continuePost.category}</span>
              )}
            </div>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${continueReading.bookmarkPercent}%` }}
                />
              </div>
              <span className={styles.progressLabel}>{continueReading.bookmarkPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Leseliste */}
      <div className={styles.sectionBlock} id="leseliste">
        <h2 className={styles.sectionTitle}>Leseliste</h2>
        {readingList.length === 0 ? (
          <p className={styles.emptyText}>
            Deine Leseliste ist leer.{' '}
            <Link href="/blog" className={styles.inlineLink}>Entdecke neue Beiträge</Link>
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {readingList.map((item) => {
              const post = postMap.get(item.postSlug);
              if (!post) return null;
              return (
                <div key={item.postSlug} className={styles.miniCard}>
                  <Link href={`/blog/${post.slug}`} className={styles.miniCardLink}>
                    <span className={styles.miniCardTitle}>{post.title}</span>
                    <span className={styles.miniCardMeta}>
                      {post.category && <span>{post.category}</span>}
                      <span>{post.readingTime} Min.</span>
                    </span>
                  </Link>
                  <form action={removeFromReadingListAction}>
                    <input type="hidden" name="postSlug" value={item.postSlug} />
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
            <Link href="/blog" className={styles.inlineLink}>Stöbere im Blog</Link>
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {favorites.map((item) => {
              const post = postMap.get(item.postSlug);
              if (!post) return null;
              return (
                <div key={item.postSlug} className={styles.miniCard}>
                  <Link href={`/blog/${post.slug}`} className={styles.miniCardLink}>
                    <span className={styles.miniCardTitle}>{post.title}</span>
                    <span className={styles.miniCardMeta}>
                      {post.category && <span>{post.category}</span>}
                    </span>
                  </Link>
                  <form action={removeFavoriteAction}>
                    <input type="hidden" name="postSlug" value={item.postSlug} />
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

      {/* Lesezeichen & Notizen */}
      <div className={styles.sectionBlock} id="lesezeichen">
        <h2 className={styles.sectionTitle}>Lesezeichen &amp; Notizen</h2>
        {bookmarked.length === 0 && withNotes.length === 0 ? (
          <p className={styles.emptyText}>
            Noch keine Lesezeichen oder Notizen vorhanden.
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {/* Merge bookmarked + notes, deduplizieren */}
            {[...new Map([...bookmarked, ...withNotes].map((i) => [i.postSlug, i])).values()].map(
              (item) => {
                const post = postMap.get(item.postSlug);
                if (!post) return null;
                return (
                  <div key={item.postSlug} className={styles.noteCard}>
                    <div className={styles.noteCardHeader}>
                      <Link href={`/blog/${post.slug}`} className={styles.miniCardTitle}>
                        {post.title}
                      </Link>
                      {item.bookmarkPercent !== null && (
                        <span className={styles.bookmarkBadge}>
                          Lesezeichen bei {item.bookmarkPercent}%
                        </span>
                      )}
                    </div>
                    {item.note && item.note.trim() && (
                      <p className={styles.notePreview}>
                        {item.note.slice(0, 150)}
                        {item.note.length > 150 ? ' …' : ''}
                      </p>
                    )}
                    {item.bookmarkPercent !== null && (
                      <form action={clearBookmarkAction} className={styles.inlineAction}>
                        <input type="hidden" name="postSlug" value={item.postSlug} />
                        <button type="submit" className={styles.smallActionBtn}>
                          Lesezeichen entfernen
                        </button>
                      </form>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* Gelesene Beiträge */}
      <div className={styles.sectionBlock} id="gelesen">
        <h2 className={styles.sectionTitle}>Gelesene Beiträge</h2>
        {readPosts.length === 0 ? (
          <p className={styles.emptyText}>
            Noch nichts gelesen.{' '}
            <Link href="/blog" className={styles.inlineLink}>Fang jetzt an</Link>
          </p>
        ) : (
          <ReadHistoryList
            posts={readPosts
              .map((item) => {
                const post = postMap.get(item.postSlug);
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

      {/* Link zu Einstellungen */}
      <div className={styles.footerLink}>
        <Link href="/einstellungen" className={styles.settingsLink}>
          Einstellungen →
        </Link>
      </div>
    </section>
  );
}
