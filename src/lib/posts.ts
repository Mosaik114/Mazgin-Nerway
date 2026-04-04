import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'src/content/posts');

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category?: string;
  coverImage?: string;
  featured?: boolean;
  readingTime: number;
  content: string;
}

interface Frontmatter {
  title?: string;
  date?: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  featured?: boolean;
  published?: boolean;
}

function calcReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function parsePost(filename: string, content: string, data: Frontmatter): Post {
  const slug = filename.replace('.md', '');

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    excerpt: data.excerpt ?? `${content.slice(0, 160).replace(/\n/g, ' ')}...`,
    category: data.category,
    coverImage: data.coverImage,
    featured: data.featured ?? false,
    readingTime: calcReadingTime(content),
    content,
  };
}

let cachedPosts: Post[] | null = null;

export function getAllPosts(): Post[] {
  const useCache = process.env.NODE_ENV === 'production';
  if (useCache && cachedPosts) return cachedPosts;

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  const posts = files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
      const { data, content } = matter(raw);
      if ((data as Frontmatter).published === false) return null;
      return parsePost(filename, content, data as Frontmatter);
    })
    .filter((p): p is Post => p !== null);

  const sorted = posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  if (useCache) cachedPosts = sorted;

  return sorted;
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
