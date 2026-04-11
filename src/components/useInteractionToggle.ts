'use client';

import { useState, useEffect } from 'react';
import type { InteractionField } from '@/types/interactions';

interface UseInteractionToggleOptions {
  essaySlug: string;
  field: InteractionField;
  initialValue?: boolean;
}

/** Shared optimistic-toggle logic for essay interaction buttons. */
export function useInteractionToggle({ essaySlug, field, initialValue = false }: UseInteractionToggleOptions) {
  const [active, setActive] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setActive(initialValue ?? false);
  }, [initialValue]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !active;
    setActive(next);
    setBusy(true);

    try {
      const res = await fetch(`/api/essays/${essaySlug}/interaction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: next }),
      });
      if (!res.ok) setActive(!next);
    } catch {
      setActive(!next);
    } finally {
      setBusy(false);
    }
  }

  return { active, busy, toggle };
}
