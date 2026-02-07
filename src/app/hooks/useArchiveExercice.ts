import { useState, useCallback } from 'react';
import type { Exercice } from '@/app/types';
import { useToast } from '@/app/contexts/ToastContext';

type UseArchiveExerciceReturn = {
  archiveExercice: (id: number, archived: boolean) => Promise<Exercice | null>;
  isArchiving: boolean;
  error: Error | null;
};

/**
 * Hook pour archiver/désarchiver un exercice
 */
export function useArchiveExercice(): UseArchiveExerciceReturn {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const archiveExercice = useCallback(async (id: number, archived: boolean): Promise<Exercice | null> => {
    setIsArchiving(true);
    setError(null);

    try {
      const response = await fetch(`/api/exercices/${id}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur HTTP: ${response.status}`);
      }

      const updatedExercice = await response.json();
      
      if (archived) {
        showToast('Exercice archivé');
      } else {
        showToast('Exercice désarchivé');
      }
      
      return updatedExercice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erreur inconnue lors de l\'archivage');
      setError(errorMessage);
      console.error('Erreur lors de l\'archivage:', errorMessage);
      return null;
    } finally {
      setIsArchiving(false);
    }
  }, [showToast]);

  return { archiveExercice, isArchiving, error };
}
