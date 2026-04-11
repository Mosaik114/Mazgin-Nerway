'use client';

import { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import type { InteractionSummary } from '@/types/interactions';

interface InteractionsContextValue {
  map: Map<string, InteractionSummary>;
}

const InteractionsContext = createContext<InteractionsContextValue>({ map: new Map() });

export function useInteractions(): Map<string, InteractionSummary> {
  return useContext(InteractionsContext).map;
}

const fetcher = (url: string): Promise<InteractionSummary[]> =>
  fetch(url, { credentials: 'same-origin' })
    .then((r) => (r.ok ? (r.json() as Promise<InteractionSummary[]>) : []))
    .catch(() => []);

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  const { data } = useSWR<InteractionSummary[]>(
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
