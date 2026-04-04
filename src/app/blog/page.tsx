import { getAllPosts } from '@/lib/posts';
import { CATEGORIES } from '@/lib/categories';
import { formatDate } from '@/lib/config';
import BlogList from './BlogList';
import styles from './blog.module.css';

export const metadata = {
  title: 'Blog',
  description: 'Alle Beiträge von Mazgin Nerway - Gedanken, Geschichten und Reflexionen.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const postCategories = Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );
  const knownCategorySet = new Set<string>(CATEGORIES);
  const usedKnownCategories = CATEGORIES.filter((cat) => postCategories.includes(cat));
  const usedNewCategories = postCategories.filter((category) => !knownCategorySet.has(category));
  const categories = ['Alle', ...usedKnownCategories, ...usedNewCategories];
  const latestPost = posts[0];
  const totalReadingTime = posts.reduce((sum, post) => sum + post.readingTime, 0);

  return (
    <section className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <p className={styles.pageTag}>Blog</p>
          <h1 className={styles.pageTitle}>Die Bibliothek meiner Gedanken</h1>
          <p className={styles.pageSubtitle}>
            Hier findest du alle Beiträge - persönlich, nachdenklich und mit Blick auf das,
            was zwischen den Zeilen liegt.
          </p>
          <div className={styles.stats}>
            <span className={styles.stat}>{posts.length} Beiträge</span>
            <span className={styles.stat}>{totalReadingTime} Min. Gesamtlesezeit</span>
            {latestPost && <span className={styles.stat}>Neu: {formatDate(latestPost.date)}</span>}
          </div>
        </header>

        <BlogList posts={posts} categories={categories} />
      </div>
    </section>
  );
}
