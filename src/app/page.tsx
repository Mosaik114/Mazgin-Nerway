import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/config';
import { getAllEssays } from '@/lib/essays';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import EssayCard from '@/components/EssayCard';
import HomeLatestEssayCard from '@/components/HomeLatestEssayCard';
import SectionTitle from '@/components/SectionTitle';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: {
    absolute: 'Nerway Essays',
  },
  description:
    'Zwischen zwei Welten entsteht meine Stimme. Ich schreibe über Identität, Sprache und die stillen Momente dazwischen. Ehrlich, persönlich und mit Blick auf das, was zwischen den Zeilen liegt.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    title: 'Nerway Essays',
    description:
      'Zwischen zwei Welten entsteht meine Stimme. Ich schreibe über Identität, Sprache und die stillen Momente dazwischen. Ehrlich, persönlich und mit Blick auf das, was zwischen den Zeilen liegt.',
    images: [
      {
        url: '/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Nerway Essays',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nerway Essays',
    description:
      'Zwischen zwei Welten entsteht meine Stimme. Ich schreibe über Identität, Sprache und die stillen Momente dazwischen. Ehrlich, persönlich und mit Blick auf das, was zwischen den Zeilen liegt.',
    images: ['/images/og-home.jpg'],
  },
};

export default function Home() {
  const allEssays = getAllEssays();
  const posts = allEssays.slice(0, 3);
  const latestPost = posts[0];

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner} ${!latestPost ? styles.heroSingle : ''}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>✦ Willkommen</div>
            <h1 className={styles.heroTitle}>
              Zwischen zwei Welten
              <span>entsteht meine Stimme.</span>
            </h1>
            <p className={styles.heroText}>
              Ich schreibe über Identität, Sprache und die stillen Momente dazwischen.
              Ehrlich, persönlich und mit Blick auf das, was zwischen den Zeilen liegt.
            </p>
            <div className={styles.heroActions}>
              <Link href="/essays" className={styles.btnPrimary}>Essays lesen</Link>
              <Link href="/about" className={styles.btnSecondary}>Über mich</Link>
            </div>
            <div className={styles.heroMeta}>
              <span>{allEssays.length} Essays</span>
              {latestPost && <span>Neu: {formatDate(latestPost.date)}</span>}
            </div>
          </div>

          {latestPost && (
            <div className={styles.heroAside}>
              <div className={styles.heroAsideCardWrap}>
                <span
                  className={styles.heroAsideBadge}
                  style={{
                    color: CATEGORY_COLORS[latestPost.category as Category] ?? 'var(--color-gold)',
                    borderColor: `${CATEGORY_COLORS[latestPost.category as Category] ?? 'var(--color-gold)'}99`,
                    backgroundColor: `${CATEGORY_COLORS[latestPost.category as Category] ?? 'var(--color-gold)'}1f`,
                  }}
                >
                  Neuester Essay
                </span>
                <HomeLatestEssayCard post={latestPost} />
              </div>
            </div>
          )}
        </div>
        <div className={styles.heroOrn} aria-hidden>✦</div>
      </section>

      {/* Letzte Posts */}
      <section className={styles.section}>
        <div className="container">
          <SectionTitle
            title="Letzte Essays"
            subtitle="Aktuelle Texte."
          />
          <div className={styles.grid}>
            {posts.map((post) => (
              <EssayCard
                key={post.slug}
                title={post.title}
                slug={post.slug}
                date={post.date}
                excerpt={post.excerpt}
                category={post.category}
                coverImage={post.coverImage}
                coverImageAlt={post.coverImageAlt}
                readingTime={post.readingTime}
              />
            ))}
          </div>
          <div className={styles.allLink}>
            <Link href="/essays" className={styles.btnSecondary}>Alle Essays →</Link>
          </div>
        </div>
      </section>

      {/* About-Vorschau */}
      <section className={styles.aboutPreview}>
        <div className={`container ${styles.aboutInner}`}>
          <div className={styles.aboutOrn}>
            <span>✦</span>
          </div>
          <h2 className={styles.aboutTitle}>Wer steckt dahinter?</h2>
          <p className={styles.aboutText}>
            Ich bin Mazgin. Aufgewachsen zwischen Kulturen, fasziniert von Sprache
            und dem, was Worte bewirken können. Diese Essays sind mein Ort zum Denken.
          </p>
          <div className={styles.aboutActions}>
            <Link href="/about" className={styles.btnSecondary}>Mehr über mich</Link>
            <Link href="/contact" className={styles.btnGhost}>Kontakt</Link>
          </div>
        </div>
      </section>
    </>
  );
}
