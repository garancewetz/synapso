'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { CATEGORY_HREFS } from '@/app/constants/exercice.constants';

/**
 * Hook pour précharger les pages fréquemment visitées
 * ⚡ PERFORMANCE MOBILE: Précharge les pages les plus utilisées pour navigation instantanée
 * 
 * Pages préchargées :
 * - Catégories d'exercices (si utilisateur disponible)
 * - Page historique
 * - Page paramètres
 */
export function usePrefetchCommonPages() {
  const router = useRouter();
  const { effectiveUser, loading } = useUser();

  useEffect(() => {
    // Ne précharger que si l'utilisateur est disponible
    if (loading || !effectiveUser) {
      return;
    }

    // Précharger les pages les plus fréquemment visitées
    const commonPages = [
      '/historique',
      '/settings',
      ...Object.values(CATEGORY_HREFS), // Toutes les catégories
    ];

    // Précharger avec un léger délai pour ne pas bloquer le chargement initial
    const timeoutId = setTimeout(() => {
      commonPages.forEach((page) => {
        router.prefetch(page);
      });
    }, 1000); // Délai de 1 seconde après le chargement initial

    return () => {
      clearTimeout(timeoutId);
    };
  }, [router, effectiveUser, loading]);
}
