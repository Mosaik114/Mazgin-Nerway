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

function calcReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function parsePost(filename: string, content: string, data: Record<string, unknown>): Post {
  const slug = filename.replace('.md', '');
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? '',
    excerpt: (data.excerpt as string) ?? content.slice(0, 160).replace(/\n/g, ' ') + '…',
    category: (data.category as string) ?? undefined,
    coverImage: (data.coverImage as string) ?? undefined,
    featured: (data.featured as boolean) ?? false,
    readingTime: calcReadingTime(content),
    content,
  };
}

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  const posts = files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
      const { data, content } = matter(raw);
      if (data.published === false) return null;
      return parsePost(filename, content, data);
    })
    .filter((p): p is Post => p !== null);

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filepath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, 'utf-8');
  const { data, content } = matter(raw);

  if (data.published === false) return null;

  return parsePost(`${slug}.md`, content, data);
}
