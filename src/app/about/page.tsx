import Link from 'next/link';
import styles from './about.module.css';

export const metadata = {
  title: 'About — Mazgin Nerway',
};

export default function AboutPage() {
  return (
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

          {/* Bild-Platzhalter */}
          <div className={styles.imagePlaceholder}>
            <span className={styles.imageInitials}>MN</span>
          </div>

          {/* Text-Blöcke */}
          <div className={styles.text}>
            <p className={styles.lead}>
              Ich bin Mazgin — aufgewachsen zwischen zwei Kulturen, zwei Sprachen
              und zwei Blickwinkeln auf die Welt.
            </p>

            <p>
              Dieser Blog ist mein Ort zum Denken. Hier schreibe ich über Dinge,
              die mich beschäftigen: Identität, Sprache, Alltag, Literatur und
              das, was dazwischen liegt.
            </p>

            <p>
              Ich glaube, dass das Schreiben eine der ehrlichsten Formen des
              Denkens ist. Nicht weil alles gesagt werden muss — sondern weil
              manches erst durch das Schreiben klar wird.
            </p>

            <div className={styles.divider}>
              <span>✦</span>
            </div>

            <p>
              Wenn du Fragen hast, Gedanken teilen möchtest oder einfach in
              Kontakt treten willst — ich freue mich.
            </p>

            <Link href="/contact" className={styles.cta}>
              Schreib mir →
            </Link>
          </div>
        </div>

        {/* Werte / Stichworte */}
        <div className={styles.values}>
          {['Sprache', 'Identität', 'Reflexion', 'Stille', 'Neugier'].map((v) => (
            <span key={v} className={styles.value}>{v}</span>
          ))}
        </div>

      </div>
    </section>
  );
}
