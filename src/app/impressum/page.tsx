import styles from './legal.module.css';

export const metadata = {
  title: 'Impressum',
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <section className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className={styles.tag}>✦ Rechtliches</div>
          <h1 className={styles.title}>Impressum</h1>
          <div className={styles.ornament}><span>✦</span></div>
        </header>

        <div className={styles.body}>
          <div className={styles.block}>
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              Mazgin Nerway<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]<br />
              Deutschland
            </p>
          </div>

          <div className={styles.block}>
            <h2>Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:kontakt@mazginnerway.de">kontakt@mazginnerway.de</a>
            </p>
          </div>

          <div className={styles.block}>
            <h2>Verantwortlich für den Inhalt</h2>
            <p>
              Mazgin Nerway<br />
              (Anschrift wie oben)
            </p>
          </div>

          <div className={styles.block}>
            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte
              auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
              §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>
          </div>

          <div className={styles.block}>
            <h2>Haftung für Links</h2>
            <p>
              Mein Angebot enthält Links zu externen Websites Dritter, auf deren
              Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden
              Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
              verantwortlich.
            </p>
          </div>

          <div className={styles.block}>
            <h2>Urheberrecht</h2>
            <p>
              Die durch mich erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
              der Grenzen des Urheberrechts bedürfen meiner schriftlichen Zustimmung.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
