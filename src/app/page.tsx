import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/config';
import { getAllPosts } from '@/lib/posts';
import { CATEGORY_COLORS, type Category } from '@/lib/categories';
import BlogCard from '@/components/BlogCard';
import SectionTitle from '@/components/SectionTitle';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mazgin Nerway – Blog über Identität, Sprache und Kultur',
  description:
    'Mazgin Nerway schreibt über Identität, Sprache, Kultur und das Leben zwischen zwei Welten. Persönliche Essays und Gedanken auf Deutsch.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    title: 'Mazgin Nerway – Blog über Identität, Sprache und Kultur',
    description:
      'Persönliche Essays über Identität, Sprache und Kultur von Mazgin Nerway.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Mazgin Nerway',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mazgin Nerway – Blog über Identität, Sprache und Kultur',
    description:
      'Persönliche Essays über Identität, Sprache und Kultur von Mazgin Nerway.',
    images: ['/opengraph-image'],
  },
};

export default function Home() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, 3);
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
              <Link href="/blog" className={styles.btnPrimary}>Blog lesen</Link>
              <Link href="/about" className={styles.btnSecondary}>Über mich</Link>
            </div>
            <div className={styles.heroMeta}>
              <span>{allPosts.length} Beiträge</span>
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
                  Neuester Beitrag
                </span>
                <BlogCard
                  title={latestPost.title}
                  slug={latestPost.slug}
                  date={latestPost.date}
                  excerpt={latestPost.excerpt}
                  category={latestPost.category}
                  coverImage={latestPost.coverImage}
                  coverImageAlt={latestPost.coverImageAlt}
                  readingTime={latestPost.readingTime}
                />
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
            title="Letzte Beiträge"
            subtitle="Aktuelle Texte aus meinem Blog."
          />
          <div className={styles.grid}>
            {posts.map((post) => (
              <BlogCard
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
            <Link href="/blog" className={styles.btnSecondary}>Alle Beiträge →</Link>
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
            und dem, was Worte bewirken können. Dieser Blog ist mein Ort zum Denken.
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
