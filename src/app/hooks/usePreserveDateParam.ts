'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useRef } from 'react';

/**
 * Hook pour préserver le paramètre `date` lors de la navigation
 * 
 * Retourne une fonction qui construit une URL en préservant le paramètre `date`
 * de l'URL actuelle s'il existe (pour le mode sablier)
 * 
 * ⚡ PERFORMANCE: Optimisé pour ne se recalculer que si le paramètre date change
 * 
 * @example
 * const preserveDate = usePreserveDateParam();
 * const href = preserveDate('/exercices/upper_body');
 * // Si l'URL actuelle est /?date=2026-01-15, retourne '/exercices/upper_body?date=2026-01-15'
 * // Sinon, retourne '/exercices/upper_body'
 */
export function usePreserveDateParam() {
  const searchParams = useSearchParams();
  const dateParamRef = useRef<string | null>(null);
  
  // ⚡ PERFORMANCE: Extraire uniquement le paramètre date pour éviter les re-renders
  // quand d'autres paramètres de l'URL changent
  const dateParam = searchParams.get('date');
  
  // ⚡ PERFORMANCE: Ne recalculer la fonction que si le paramètre date change vraiment
  return useMemo(() => {
    dateParamRef.current = dateParam;
    
    return (href: string): string => {
      // Utiliser la valeur du ref pour éviter les dépendances
      const currentDateParam = dateParamRef.current;
      
      // Si pas de paramètre date, retourner l'URL telle quelle
      if (!currentDateParam) {
        return href;
      }
      
      // Séparer le pathname, les query params et le hash
      const [pathAndQuery, hash = ''] = href.split('#');
      const [pathname, existingQuery = ''] = pathAndQuery.split('?');
      const params = new URLSearchParams(existingQuery);
      
      // Ajouter le paramètre date
      params.set('date', currentDateParam);
      
      // Reconstruire l'URL avec le paramètre date et le hash
      const queryString = params.toString();
      const urlWithQuery = queryString ? `${pathname}?${queryString}` : pathname;
      return hash ? `${urlWithQuery}#${hash}` : urlWithQuery;
    };
  }, [dateParam]); // ⚡ PERFORMANCE: Dépendance uniquement sur dateParam, pas sur searchParams entier
}
