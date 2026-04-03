import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import styles from './post.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post nicht gefunden' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `https://mazginnerway.de/blog/${post.slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const processed = await remark().use(html).process(post.content);
  const contentHtml = processed.toString();

  const formatted = new Date(post.date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Prev/Next
  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const nextPost = idx > 0 ? allPosts[idx - 1] : null;

  // Verwandte Posts (gleiche Kategorie, max. 2)
  const related = post.category
    ? allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 2)
    : [];

  return (
    <article className={styles.page}>
      <div className="container">

        {/* Zurück */}
        <Link href="/blog" className={styles.back}>
          ← Zurück zum Blog
        </Link>

        {/* Cover-Bild */}
        {post.coverImage && (
          <div className={styles.coverWrap}>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className={styles.coverImg}
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.meta}>
            {post.category && (
              <span className={styles.category}>{post.category}</span>
            )}
            <time className={styles.date}>{formatted}</time>
            <span className={styles.readTime}>{post.readingTime} Min. Lesezeit</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>

          <div className={styles.ornament}>
            <span>✦</span>
          </div>
        </header>

        {/* Inhalt */}
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Prev/Next Navigation */}
        <nav className={styles.postNav}>
          <div className={styles.navItem}>
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className={styles.navLink}>
                <span className={styles.navLabel}>← Vorheriger Beitrag</span>
                <span className={styles.navTitle}>{prevPost.title}</span>
              </Link>
            )}
          </div>
          <div className={`${styles.navItem} ${styles.navItemRight}`}>
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className={`${styles.navLink} ${styles.navLinkRight}`}>
                <span className={styles.navLabel}>Nächster Beitrag →</span>
                <span className={styles.navTitle}>{nextPost.title}</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Verwandte Posts */}
        {related.length > 0 && (
          <aside className={styles.related}>
            <div className={styles.ornament}><span>✦</span></div>
            <h2 className={styles.relatedTitle}>Weitere Beiträge in „{post.category}"</h2>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className={styles.relatedCard}>
                  <span className={styles.relatedCategory}>{r.category}</span>
                  <span className={styles.relatedCardTitle}>{r.title}</span>
                  <span className={styles.relatedExcerpt}>{r.excerpt}</span>
                  <span className={styles.relatedReadMore}>Lesen →</span>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Footer */}
        <footer className={styles.postFooter}>
          <div className={styles.ornament}>
            <span>✦</span>
          </div>
          <Link href="/blog" className={styles.backBottom}>
            ← Alle Beiträge
          </Link>
        </footer>

      </div>
    </article>
  );
}
