import Image from 'next/image';
import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  size?: number;
}

export default function UserAvatar({ image, name, size = 36 }: UserAvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || '?';

  if (image) {
    return (
      <span className={styles.avatar} style={{ width: size, height: size }}>
        <Image
          src={image}
          alt={name ?? 'Profilbild'}
          width={size}
          height={size}
          className={styles.image}
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      <span className={styles.initial}>{initial}</span>
    </span>
  );
}
