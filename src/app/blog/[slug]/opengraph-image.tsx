import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/config';

export const alt = 'Blogbeitrag';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.seoTitle ?? post?.title ?? 'Beitrag nicht gefunden';
  const category = post?.category ?? '';
  const date = post ? formatDate(post.date) : '';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0e0c',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
        }}
      >
        {/* Top: category + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {category && (
            <span
              style={{
                color: '#c9a84c',
                fontSize: 22,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {category}
            </span>
          )}
          {date && (
            <span style={{ color: '#8a8070', fontSize: 22 }}>
              {category ? ' · ' : ''}{date}
            </span>
          )}
        </div>

        {/* Middle: title */}
        <div
          style={{
            color: '#e8e0d4',
            fontSize: title.length > 40 ? 56 : 72,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Bottom: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#c9a84c', fontSize: 24, letterSpacing: 6 }}>
            ✦
          </span>
          <span style={{ color: '#8a8070', fontSize: 24 }}>
            mazginnerway.de
          </span>
        </div>
      </div>
    ),
    size,
  );
}
