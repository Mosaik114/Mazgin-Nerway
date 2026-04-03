import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import { SITE_URL } from '@/lib/config';
import { themeScript } from '@/lib/theme';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Mazgin Nerway',
    template: '%s — Mazgin Nerway',
  },
  description: 'Gedanken, Geschichten und Reflexionen — irgendwo zwischen zwei Welten.',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: SITE_URL,
    siteName: 'Mazgin Nerway',
    title: 'Mazgin Nerway',
    description: 'Gedanken, Geschichten und Reflexionen — irgendwo zwischen zwei Welten.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mazgin Nerway',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mazgin Nerway',
    description: 'Gedanken, Geschichten und Reflexionen — irgendwo zwischen zwei Welten.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Zum Inhalt springen</a>
        <Analytics />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
