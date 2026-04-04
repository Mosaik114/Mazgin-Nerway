import Image from 'next/image';
import styles from './about.module.css';

export const metadata = {
  title: 'Über mich',
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
          <div className={styles.imageWrap}>
            <Image
              src="/images/PB-Bild.png"
              alt="Porträt von Mazgin Nerway"
              fill
              sizes="(max-width: 768px) 467px, (max-width: 1024px) 574px, 682px"
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
