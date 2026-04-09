import type { Metadata } from 'next';
import { getCspNonce } from '@/lib/csp';
import { SITE_LANGUAGE, SITE_NAME, toAbsoluteUrl, toJsonLd } from '@/lib/seo';
import ContactForm from './ContactForm';
import styles from './contact.module.css';

const CONTACT_DESCRIPTION = 'Kontaktiere Mazgin Nerway – für Fragen, Kooperationen oder einfach um hallo zu sagen.';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: CONTACT_DESCRIPTION,
  alternates: {
    canonical: '/contact',
    languages: {
      [SITE_LANGUAGE]: '/contact',
      'x-default': '/contact',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: `Kontakt | ${SITE_NAME}`,
    description: CONTACT_DESCRIPTION,
    url: '/contact',
  },
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
      name: 'Kontakt',
      item: toAbsoluteUrl('/contact'),
    },
  ],
};

export default async function ContactPage() {
  const nonce = await getCspNonce();

  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />
    <section className={styles.page}>
      <div className="container">

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.tag}>✦ Kontakt</div>
          <h1 className={styles.title}>Schreib mir</h1>
          <p className={styles.subtitle}>
            Du hast eine Frage, einen Gedanken oder möchtest einfach hallo sagen?
            Ich freue mich über jede Nachricht.
          </p>
          <div className={styles.ornament}><span>✦</span></div>
        </header>

        <div className={styles.layout}>

          {/* Formular */}
          <div className={styles.formWrap}>
            <ContactForm />
          </div>

          {/* Info-Block */}
          <aside className={styles.info}>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Antwortzeit</h3>
              <p className={styles.infoText}>
                Ich antworte in der Regel innerhalb von 1–2 Tagen.
              </p>
            </div>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Themen</h3>
              <p className={styles.infoText}>
                Kooperationen, Feedback, allgemeine Nachrichten — alles willkommen.
              </p>
            </div>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Sprachen</h3>
              <p className={styles.infoText}>Deutsch · Englisch · Kurdisch</p>
            </div>
          </aside>

        </div>
      </div>
    </section>
    </>
  );
}
