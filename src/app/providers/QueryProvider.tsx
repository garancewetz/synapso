'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

export function QueryProvider({ children }: PropsWithChildren) {
  // ⚡ PERFORMANCE: Créer le QueryClient une seule fois (singleton)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ⚡ CACHE: Données considérées "fraîches" pendant 30 secondes
        staleTime: 30000,
        // ⚡ CACHE: Garder les données en cache pendant 5 minutes
        gcTime: 5 * 60 * 1000, // (anciennement cacheTime)
        // ⚡ REFETCH: Ne pas refetch automatiquement au focus (évite les requêtes inutiles)
        refetchOnWindowFocus: false,
        // ⚡ REFETCH: Ne pas refetch automatiquement au reconnect (évite les requêtes inutiles)
        refetchOnReconnect: false,
        // ⚡ RETRY: Retry automatique en cas d'erreur (2 tentatives)
        retry: 2,
        // ⚡ RETRY: Délai entre les tentatives (1 seconde)
        retryDelay: 1000,
      },
      mutations: {
        // ⚡ RETRY: Ne pas retry les mutations (erreurs immédiates)
        retry: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
