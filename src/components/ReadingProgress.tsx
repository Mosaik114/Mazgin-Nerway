'use client';

import { useEffect, useState } from 'react';
import styles from './ReadingProgress.module.css';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      if (scrollable <= 0) {
        setProgress(0);
        return;
      }

      const next = (window.scrollY / scrollable) * 100;
      setProgress(clamp(next, 0, 100));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label="Lesefortschritt"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <span
        className={styles.value}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
