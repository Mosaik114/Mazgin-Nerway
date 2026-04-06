import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UmamiAnalytics from '@/components/Analytics';
import { SITE_URL } from '@/lib/config';
import { SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, SITE_PERSON_GENDER, toJsonLd } from '@/lib/seo';
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

const shouldIndexSite =
  process.env.NODE_ENV === 'production'
  && (!process.env.VERCEL || process.env.VERCEL_ENV === 'production');

const metadataRobots: Metadata['robots'] = shouldIndexSite
  ? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    }
  : {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        'max-image-preview': 'none',
        'max-snippet': 0,
        'max-video-preview': 0,
      },
    };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  category: 'Literatur',
  alternates: {
    canonical: '/',
    languages: {
      [SITE_LANGUAGE]: '/',
      'x-default': '/',
    },
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/images/og-home.jpg'],
  },
  robots: metadataRobots,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: SITE_LANGUAGE,
  publisher: {
    '@type': 'Person',
    name: SITE_NAME,
    gender: SITE_PERSON_GENDER,
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  alternateName: ['Nerway', 'Mazgin'],
  url: SITE_URL,
  image: `${SITE_URL}/images/mazgin-rechts.png`,
  jobTitle: 'Autor & Blogger',
  description:
    'Mazgin Nerway ist Blogger und Autor. Er schreibt auf Deutsch über Identität, Sprache und das Leben zwischen zwei Kulturen.',
  gender: SITE_PERSON_GENDER,
  knowsLanguage: ['de', 'de-DE'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/about`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(personJsonLd) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">Zum Inhalt springen</a>
        <UmamiAnalytics />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
