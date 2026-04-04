import ContactForm from './ContactForm';
import styles from './contact.module.css';

export const metadata = {
  title: 'Kontakt',
};

export default function ContactPage() {
  return (
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
  );
}
