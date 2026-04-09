'use client';

import { useRef, useState } from 'react';
import UserAvatar from '@/components/UserAvatar';
import styles from './einstellungen.module.css';

interface Props {
  currentImage?: string | null;
  name?: string | null;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas nicht verfügbar'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Bild konnte nicht geladen werden'));
    };

    img.src = url;
  });
}

export default function AvatarUpload({ currentImage, name }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayImage = preview ?? currentImage;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Nur JPEG, PNG oder WebP erlaubt.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Datei zu groß (max. 5 MB).');
      return;
    }

    try {
      const dataUrl = await resizeImage(file, 256);
      setPreview(dataUrl);
    } catch {
      setError('Bild konnte nicht verarbeitet werden.');
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: preview }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Fehler beim Speichern.');
        return;
      }

      setSuccess('Profilbild gespeichert.');
      setPreview(null);
      setTimeout(() => setSuccess(''), 3000);
      // Reload to update all avatar instances
      window.location.reload();
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        setError('Fehler beim Entfernen.');
        return;
      }

      setPreview(null);
      setSuccess('Profilbild entfernt.');
      setTimeout(() => setSuccess(''), 3000);
      window.location.reload();
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.avatarSection}>
      <div className={styles.avatarPreview}>
        <UserAvatar image={displayImage} name={name} size={80} />
      </div>
      <div className={styles.avatarControls}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <div className={styles.avatarButtons}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => inputRef.current?.click()}
            disabled={saving}
          >
            Bild auswählen
          </button>
          {preview && (
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Speichern …' : 'Speichern'}
            </button>
          )}
          {currentImage && !preview && (
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={handleRemove}
              disabled={saving}
            >
              Entfernen
            </button>
          )}
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
        {success && <p className={styles.successText}>{success}</p>}
      </div>
    </div>
  );
}
