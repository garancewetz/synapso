import { useState, useEffect, useCallback } from 'react';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import { useUser } from '@/app/contexts/UserContext';

type UseExercicesOptions = {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
};

type UseExercicesReturn = {
  exercices: Exercice[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateExercice: (updatedExercice: Exercice) => void;
};

/**
 * Hook personnalisé pour gérer les exercices
 * Centralise la logique de récupération et de mise à jour des exercices
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useExercices({ category, equipments, includeArchived }: UseExercicesOptions = {}): UseExercicesReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercices = useCallback(async () => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }
    
    // Ne pas charger si pas d'utilisateur effectif
    if (!effectiveUser) {
      setLoading(false);
      setExercices([]);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (category) {
        params.append('category', category);
      }
      if (equipments && equipments.length > 0) {
        params.append('equipments', equipments.map(eq => encodeURIComponent(eq)).join(','));
      }
      if (includeArchived) {
        params.append('includeArchived', 'true');
      }
      
      const url = params.toString() 
        ? `/api/exercices?${params.toString()}`
        : `/api/exercices`;
      
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Erreur HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setExercices(data);
      } else {
        setExercices([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erreur inconnue lors de la récupération des exercices');
      setError(errorMessage);
      setExercices([]);
      console.error('Erreur lors de la récupération des exercices:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category, equipments, includeArchived, effectiveUser, userLoading]);

  useEffect(() => {
    fetchExercices();
  }, [fetchExercices]);

  const updateExercice = (updatedExercice: Exercice) => {
    setExercices(prev => {
      const updated = prev.map(ex => 
        ex.id === updatedExercice.id ? updatedExercice : ex
      );
      
      if (!includeArchived && updatedExercice.archived) {
        return updated.filter(ex => ex.id !== updatedExercice.id);
      }
      
      return updated;
    });
  };

  return {
    exercices,
    loading: loading || userLoading,
    error,
    refetch: fetchExercices,
    updateExercice,
  };
}
