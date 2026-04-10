'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Interaction {
  essaySlug: string;
  isRead: boolean;
  isFavorite: boolean;
  isOnReadingList: boolean;
}

interface InteractionsContextValue {
  map: Map<string, Interaction>;
}

const InteractionsContext = createContext<InteractionsContextValue>({ map: new Map() });

export function useInteractions(): Map<string, Interaction> {
  return useContext(InteractionsContext).map;
}

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [map, setMap] = useState<Map<string, Interaction>>(new Map());

  const load = useCallback(() => {
    if (status !== 'authenticated') {
      setMap(new Map());
      return;
    }

    void fetch('/api/interactions', { cache: 'no-store', credentials: 'same-origin' })
      .then((r) => (r.ok ? (r.json() as Promise<Interaction[]>) : []))
      .then((data) => setMap(new Map(data.map((i) => [i.essaySlug, i]))))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <InteractionsContext.Provider value={{ map }}>
      {children}
    </InteractionsContext.Provider>
  );
}
