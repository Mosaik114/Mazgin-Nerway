import styles from '../impressum/legal.module.css';

export const metadata = {
  title: 'Datenschutz',
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <section className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className={styles.tag}>✦ Rechtliches</div>
          <h1 className={styles.title}>Datenschutzerklärung</h1>
          <div className={styles.ornament}><span>✦</span></div>
        </header>

        <div className={styles.body}>
          <div className={styles.block}>
            <h2>1. Verantwortlicher</h2>
            <p>
              Mazgin Nerway<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]<br />
              E-Mail: <a href="mailto:kontakt@mazginnerway.de">kontakt@mazginnerway.de</a>
            </p>
          </div>

          <div className={styles.block}>
            <h2>2. Erhebung und Verarbeitung von Daten</h2>
            <p>
              Diese Website erhebt beim bloßen Besuch keine personenbezogenen Daten
              außer den Daten, die dein Browser automatisch übermittelt (z.B.
              IP-Adresse, Browsertyp, Betriebssystem). Diese Daten werden nicht
              gespeichert oder ausgewertet.
            </p>
          </div>

          <div className={styles.block}>
            <h2>3. Kontaktformular</h2>
            <p>
              Wenn du das Kontaktformular nutzt, werden die von dir angegebenen Daten
              (Name, E-Mail-Adresse, Nachricht) ausschließlich zur Bearbeitung deiner
              Anfrage verwendet und nicht an Dritte weitergegeben. Die Daten werden
              nach Abschluss der Bearbeitung gelöscht, sofern keine gesetzlichen
              Aufbewahrungspflichten bestehen.
            </p>
          </div>

          <div className={styles.block}>
            <h2>4. Hosting</h2>
            <p>
              Diese Website wird bei Vercel Inc. gehostet. Vercel kann beim Aufruf
              der Website technische Daten (z.B. IP-Adresse, Zeitpunkt des Abrufs)
              in sogenannten Server-Logs erfassen. Weitere Informationen findest du
              in der{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                Datenschutzerklärung von Vercel
              </a>.
            </p>
          </div>

          <div className={styles.block}>
            <h2>5. Schriftarten</h2>
            <p>
              Diese Website verwendet Google Fonts, die lokal eingebunden sind.
              Es findet keine Verbindung zu Google-Servern statt.
            </p>
          </div>

          <div className={styles.block}>
            <h2>6. Cookies</h2>
            <p>
              Diese Website verwendet keine Tracking-Cookies und kein Analytics.
              Es werden ausschließlich technisch notwendige Daten verarbeitet.
            </p>
          </div>

          <div className={styles.block}>
            <h2>7. Deine Rechte</h2>
            <p>
              Du hast das Recht auf Auskunft, Berichtigung, Löschung und
              Einschränkung der Verarbeitung deiner personenbezogenen Daten.
              Wende dich dazu jederzeit per E-Mail an mich.
            </p>
          </div>

          <div className={styles.block}>
            <h2>8. Beschwerderecht</h2>
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren, wenn du der Ansicht bist, dass die Verarbeitung
              deiner Daten gegen die DSGVO verstößt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
