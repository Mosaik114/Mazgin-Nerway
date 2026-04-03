import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  );
}
