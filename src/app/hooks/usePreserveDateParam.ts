'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Hook pour préserver le paramètre `date` lors de la navigation
 * 
 * Retourne une fonction qui construit une URL en préservant le paramètre `date`
 * de l'URL actuelle s'il existe (pour le mode sablier)
 * 
 * @example
 * const preserveDate = usePreserveDateParam();
 * const href = preserveDate('/exercices/upper_body');
 * // Si l'URL actuelle est /?date=2026-01-15, retourne '/exercices/upper_body?date=2026-01-15'
 * // Sinon, retourne '/exercices/upper_body'
 */
export function usePreserveDateParam() {
  const searchParams = useSearchParams();
  
  return useMemo(() => {
    const dateParam = searchParams.get('date');
    
    return (href: string): string => {
      // Si pas de paramètre date, retourner l'URL telle quelle
      if (!dateParam) {
        return href;
      }
      
      // Séparer le pathname et les query params existants
      const [pathname, existingQuery = ''] = href.split('?');
      const params = new URLSearchParams(existingQuery);
      
      // Ajouter le paramètre date
      params.set('date', dateParam);
      
      // Reconstruire l'URL avec le paramètre date
      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    };
  }, [searchParams]);
}
