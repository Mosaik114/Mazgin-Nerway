import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mizgin Nerway';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0e0c',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{ color: '#c9a84c', fontSize: 24, letterSpacing: 6, marginBottom: 24 }}>
          ✦ ── ── ──
        </div>
        <div
          style={{
            color: '#e8e0d4',
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Mizgin{' '}
          <span style={{ color: '#c9a84c' }}>Nerway</span>
        </div>
        <div style={{ color: '#8a8070', fontSize: 28, marginTop: 24, maxWidth: 700 }}>
          Gedanken, Geschichten und Reflexionen
        </div>
        <div style={{ color: '#c9a84c', fontSize: 24, letterSpacing: 6, marginTop: 40 }}>
          ── ── ── ✦
        </div>
      </div>
    ),
    size,
  );
}
