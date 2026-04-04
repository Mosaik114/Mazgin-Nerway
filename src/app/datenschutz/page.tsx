import styles from '../impressum/legal.module.css';
import { LEGAL_CONTACT, USES_UMAMI_ANALYTICS } from '@/lib/legal';

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
              {LEGAL_CONTACT.name}<br />
              {LEGAL_CONTACT.street}<br />
              {LEGAL_CONTACT.postalCode} {LEGAL_CONTACT.city}<br />
              E-Mail: <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>
            </p>
          </div>

          <div className={styles.block}>
            <h2>2. Zugriffsdaten und Hosting</h2>
            <p>
              Beim Aufruf dieser Website werden technische Daten verarbeitet, die dein Browser
              automatisch übermittelt (z. B. IP-Adresse, Datum und Uhrzeit, angeforderte Seite,
              Browsertyp, Betriebssystem, Referrer). Die Verarbeitung erfolgt zur Auslieferung,
              Stabilität und Sicherheit der Website.
            </p>
            <p>
              Diese Website wird bei Vercel Inc. gehostet. Dabei können Server-Log-Daten
              verarbeitet werden. Weitere Informationen findest du in der{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                Datenschutzerklärung von Vercel
              </a>.
            </p>
          </div>

          <div className={styles.block}>
            <h2>3. Kontaktformular</h2>
            <p>
              Wenn du das Kontaktformular nutzt, werden die von dir angegebenen Daten
              (Name, E-Mail-Adresse, Nachricht) ausschließlich zur Bearbeitung deiner
              Anfrage verwendet. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. b DSGVO (vorvertragliche Kommunikation) bzw. lit. f DSGVO (berechtigtes
              Interesse an der Bearbeitung eingehender Anfragen).
            </p>
            <p>
              Zur Spam-Abwehr werden technische Schutzmaßnahmen wie Honeypot-Feld und
              Rate-Limiting eingesetzt.
            </p>
          </div>

          <div className={styles.block}>
            <h2>4. Reichweitenmessung</h2>
            {USES_UMAMI_ANALYTICS ? (
              <p>
                Diese Website nutzt Umami zur datenschutzfreundlichen Reichweitenmessung.
                Dabei werden keine Tracking-Cookies gesetzt. Es werden nur technisch
                notwendige, aggregierte Nutzungsdaten verarbeitet.
              </p>
            ) : (
              <p>
                Derzeit wird kein externes Analytics-Tool zur Reichweitenmessung eingesetzt.
              </p>
            )}
          </div>

          <div className={styles.block}>
            <h2>5. Schriftarten</h2>
            <p>
              Diese Website verwendet lokal eingebundene Schriftarten. Es wird keine
              Verbindung zu Google Fonts oder anderen externen Font-Diensten aufgebaut.
            </p>
          </div>

          <div className={styles.block}>
            <h2>6. Cookies und lokale Speicherung</h2>
            <p>
              Es werden keine Marketing- oder Tracking-Cookies gesetzt. Für die
              Darstellungsoption (Dark-/Hellmodus) kann ein Eintrag im Local Storage
              deines Browsers gespeichert werden.
            </p>
          </div>

          <div className={styles.block}>
            <h2>7. Deine Rechte</h2>
            <p>
              Du hast das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung sowie auf Beschwerde bei einer
              Datenschutz-Aufsichtsbehörde. Wende dich dazu per E-Mail an mich.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
