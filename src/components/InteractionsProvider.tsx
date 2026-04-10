'use client';

import { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

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

const fetcher = (url: string): Promise<Interaction[]> =>
  fetch(url, { credentials: 'same-origin' })
    .then((r) => (r.ok ? (r.json() as Promise<Interaction[]>) : []))
    .catch(() => []);

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  const { data } = useSWR<Interaction[]>(
    status === 'authenticated' ? '/api/interactions' : null,
    fetcher,
    { revalidateOnFocus: true },
  );

  const map = useMemo(
    () => new Map((data ?? []).map((i) => [i.essaySlug, i])),
    [data],
  );

  return (
    <InteractionsContext.Provider value={{ map }}>
      {children}
    </InteractionsContext.Provider>
  );
}
