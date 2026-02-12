'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Exercice } from '@/app/types';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys } from '@/app/lib/api-queries';

type UseCompleteExerciceOptions = {
  exercice: Exercice;
  userId: number;
  onCompleted?: (updatedExercice: Exercice) => void;
};

type UseCompleteExerciceReturn = {
  handleComplete: (e: React.MouseEvent) => void;
  isCompleting: boolean;
  showSuccess: boolean;
};

export function useCompleteExercice({
  exercice,
  userId,
  onCompleted,
}: UseCompleteExerciceOptions): UseCompleteExerciceReturn {
  const [showSuccess, setShowSuccess] = useState(false);
  const { referenceDateKey } = useTimeContext();
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();

  const targetDate = referenceDateKey || format(new Date(), 'yyyy-MM-dd');
  const willComplete = !exercice.completedToday;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/exercices/${exercice.id}/complete?userId=${userId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedAt: targetDate }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('[COMPLETE] ✅ Serveur a retourné:', {
        exerciceId: exercice.id,
        exerciceName: exercice.name,
        completed: data.completed,
        completedToday: data.completedToday,
        targetDate,
      });

      const weeklyCompletionsRaw = data.weeklyCompletions || [];
      const weeklyCompletions = weeklyCompletionsRaw.map((d: Date | string) =>
        typeof d === 'string' ? new Date(d) : d
      );

      const updatedExercice: Exercice = {
        ...exercice,
        completed: data.completed,
        completedToday: data.completedToday ?? false,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        weeklyCompletions,
      };

      if (!exercice.completedToday && updatedExercice.completedToday) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }

      onCompleted?.(updatedExercice);

      // ⚡ CACHE INVALIDATION CIBLÉE: Invalider uniquement les queries de la date concernée
      // Cela évite de refetch toutes les dates et améliore les performances
      
      // Invalider toutes les queries exercices avec ce targetDate (toutes les variantes de filtres)
      queryClient.invalidateQueries({ 
        queryKey: ['exercices', 'list'],
        predicate: (query) => {
          const filters = query.queryKey[2] as { targetDate?: string } | undefined;
          return filters?.targetDate === targetDate;
        },
        refetchType: 'active',
      });
      
      // ⚡ FIX: Invalider toutes les queries history (actives et inactives)
      // Le problème : si on complète un exercice en mode sablier puis qu'on retourne sur la home,
      // la query history utilisée par useCategoryStats doit être invalidée et refetchée
      // Solution : invalider toutes les queries history (sans refetchType pour marquer comme invalidées)
      // + refetchOnMount: true dans useCategoryStats garantit le refetch au prochain montage
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.history.all,
        // ⚡ FIX: Ne pas utiliser refetchType pour invalider toutes les queries (actives et inactives)
        // Par défaut, seules les queries actives sont refetchées immédiatement,
        // mais toutes les queries sont marquées comme invalidées
        // refetchOnMount: true dans useCategoryStats garantit le refetch au prochain montage
        refetchType: 'active', // Refetch immédiat des queries actives
        // Toutes les queries (actives et inactives) sont marquées comme invalidées
        // et seront refetchées au prochain montage grâce à refetchOnMount: true
      });
      
      // Invalider categoryStats pour cette date spécifique
      if (effectiveUser?.id && effectiveUser?.resetFrequency) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.categoryStats.list({
            userId: effectiveUser.id,
            resetFrequency: effectiveUser.resetFrequency,
            referenceDateKey: targetDate,
          }),
          refetchType: 'active',
        });
      }
      
      // Invalider todayCompletedCount pour cette date spécifique
      if (effectiveUser?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.todayCompletedCount.list({
            userId: effectiveUser.id,
            dateKey: targetDate,
          }),
          refetchType: 'active',
        });
      }
    },
  });

  const handleComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (userId) {
        console.log('[COMPLETE] 🖱️ Click:', {
          exerciceId: exercice.id,
          exerciceName: exercice.name,
          action: willComplete ? 'COMPLÉTER' : 'DÉCOMPLÉTER',
          targetDate,
        });
        mutate();
      }
    },
    [userId, mutate, exercice.id, exercice.name, willComplete, targetDate]
  );

  return {
    handleComplete,
    isCompleting: isPending,
    showSuccess,
  };
}
