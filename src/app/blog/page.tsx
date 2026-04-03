import { getAllPosts } from '@/lib/posts';
import { CATEGORIES } from '@/lib/categories';
import SectionTitle from '@/components/SectionTitle';
import BlogList from './BlogList';
import styles from './blog.module.css';

export const metadata = {
  title: 'Blog',
  description: 'Alle Beiträge von Mazgin Nerway — Gedanken, Geschichten und Reflexionen.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const usedCategories = CATEGORIES.filter((cat) => posts.some((p) => p.category === cat));
  const categories = ['Alle', ...usedCategories];

  return (
    <section className={styles.page}>
      <div className="container">
        <SectionTitle
          title="Blog"
          subtitle="Gedanken, Geschichten und Reflexionen."
        />
        <BlogList posts={posts} categories={categories} />
      </div>
    </section>
  );
}
