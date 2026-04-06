import type { Metadata } from 'next';
import Image from 'next/image';
import { SITE_URL, SOCIAL_LINKS } from '@/lib/config';
import { SITE_NAME, SITE_PERSON_GENDER, toAbsoluteUrl, toJsonLd } from '@/lib/seo';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'Über mich',
  description:
    'Ich bin Mazgin Nerway – Blogger und Autor. Aufgewachsen zwischen Kulturen, schreibe ich auf Deutsch über Identität, Sprache und das, was dazwischen liegt.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'profile',
    locale: 'de_DE',
    url: '/about',
    title: `Über mich | ${SITE_NAME}`,
    description:
      'Aufgewachsen zwischen Kulturen, schreibe ich auf Deutsch über Identität, Sprache und das, was dazwischen liegt.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Über mich | ${SITE_NAME}`,
    description:
      'Aufgewachsen zwischen Kulturen, schreibe ich auf Deutsch über Identität, Sprache und das, was dazwischen liegt.',
    images: ['/opengraph-image'],
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
  sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok],
  knowsLanguage: ['de', 'de-DE'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/about`,
  },
};

const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: `Über mich | ${SITE_NAME}`,
  url: `${SITE_URL}/about`,
  description:
    'Mazgin Nerway ist Blogger und Autor. Er schreibt auf Deutsch über Identität, Sprache und das Leben zwischen zwei Kulturen.',
  mainEntity: personJsonLd,
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Startseite',
      item: toAbsoluteUrl('/'),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Über mich',
      item: toAbsoluteUrl('/about'),
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(profilePageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />
    <section className={styles.page}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.tag}>✦ Über mich</div>
          <h1 className={styles.title}>Mazgin Nerway</h1>

          <div className={styles.ornament}>
            <span>✦</span>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.imageWrap}>
            <Image
              src="/images/mazgin-rechts.png"
              alt="Porträt von Mazgin Nerway"
              fill
              sizes="(max-width: 768px) 470px, (max-width: 1024px) 575px, 685px"
              quality={90}
              className={styles.profileImage}
              priority
            />
          </div>

          <div className={styles.text}>
            <p className={styles.lead}>
              Es gibt Sätze, die man jahrelang mit sich trägt. Nicht weil man sie vergessen hat.
              Sondern weil man noch nicht bereit war, sie zu schreiben. Und dann kommt ein
              Abend, ein Geruch und man schreibt sie. Und sitzt da. Und weiß,
              dass man sie nicht mehr zurücknehmen kann. Das sind dann meistens die richtigen.
            </p>
            <p>
              Ich bin Mazgin. Ein Name, der in manchen Mündern stolpert und in anderen einfach
              sitzt. Ein Name zwischen Sprachen, wie ich selbst. Ich schreibe auf Deutsch, träume
              auf Deutsch und trage trotzdem Dinge in mir, für die das Deutsche noch kein Wort
              hat. Diesen Zwischenraum kenne ich gut. Ich lebe darin. Und ich schreibe aus ihm
              heraus.
            </p>
            <p>
              Nicht um zu erklären. Nicht um anzukommen. Sondern weil das Schreiben herausfindet,
              was ich denke, nicht umgekehrt.
            </p>
            <p>
              Hier entstehen Texte über Momente, die klein aussehen und es nicht sind. Über das,
              was zwischen den Sprachen liegt, zwischen den Identitäten, zwischen dem, was man
              ist, und dem, was andere daraus machen wollen. Über das Trotzdem.
            </p>
            <p>Wenn du auch weißt, wie sich das anfühlt, dann bist du hier richtig.</p>
            <p>Kein Fazit. Kein Archiv. Nur das Denken, das irgendwo anfangen muss.</p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
