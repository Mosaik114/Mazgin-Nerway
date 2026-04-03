import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';
import SectionTitle from '@/components/SectionTitle';
import styles from './page.module.css';

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroTag}>✦ Willkommen</div>
          <h1 className={styles.heroTitle}>
            Mazgin<br />
            <span>Nerway</span>
          </h1>
          <p className={styles.heroText}>
            Gedanken, Geschichten und Reflexionen — irgendwo zwischen zwei Welten.
          </p>
          <div className={styles.heroActions}>
            <Link href="/blog" className={styles.btnPrimary}>Blog lesen</Link>
            <Link href="/about" className={styles.btnSecondary}>Über mich</Link>
          </div>
        </div>
        <div className={styles.heroOrn}>✦</div>
      </section>

      {/* Letzte Posts */}
      <section className={styles.section}>
        <div className="container">
          <SectionTitle
            title="Letzte Beiträge"
            subtitle="Gedanken, die ich mit dir teilen möchte."
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
            Ich bin Mazgin — aufgewachsen zwischen Kulturen, fasziniert von Sprache
            und dem, was Worte bewirken können. Dieser Blog ist mein Ort zum Denken.
          </p>
          <Link href="/about" className={styles.btnSecondary}>Mehr erfahren</Link>
        </div>
      </section>
    </>
  );
}
