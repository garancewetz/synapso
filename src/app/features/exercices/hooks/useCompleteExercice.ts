'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Exercice, HistoryEntry } from '@/app/types';
import { useTimeContext } from '@/app/contexts/TimeContext';
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
  const queryClient = useQueryClient();

  const targetDate = referenceDateKey || format(new Date(), 'yyyy-MM-dd');
  const isCompleting = !exercice.completedToday;

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
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.exercices.all }),
        queryClient.cancelQueries({ queryKey: queryKeys.history.all }),
      ]);

      const previousExercices = queryClient.getQueriesData<Exercice[]>({ queryKey: queryKeys.exercices.all });
      const previousHistory = queryClient.getQueriesData<HistoryEntry[]>({ queryKey: queryKeys.history.all });

      const optimisticEntry: HistoryEntry = {
        id: -Date.now(),
        completedAt: targetDate + 'T12:00:00.000Z',
        exercice: {
          id: exercice.id,
          name: exercice.name,
          category: exercice.category,
          bodyparts: exercice.bodyparts.map(name => ({ id: 0, name })),
          equipments: exercice.equipments,
        },
      };

      queryClient.setQueriesData<Exercice[]>(
        { predicate: (query) => query.queryKey[0] === 'exercices' },
        (old) => old?.map(ex =>
          ex.id === exercice.id
            ? { ...ex, completedToday: isCompleting, completed: isCompleting }
            : ex
        ) ?? []
      );

      queryClient.setQueriesData<HistoryEntry[]>(
        { predicate: (query) => query.queryKey[0] === 'history' },
        (old) => {
          if (isCompleting) {
            const existing = old?.some(
              entry =>
                entry.exercice.id === exercice.id &&
                format(new Date(entry.completedAt), 'yyyy-MM-dd') === targetDate
            );
            if (existing) return old ?? [];
            return old ? [...old, optimisticEntry] : [optimisticEntry];
          }
          return old?.filter(
            entry =>
              entry.exercice.id !== exercice.id ||
              format(new Date(entry.completedAt), 'yyyy-MM-dd') !== targetDate
          ) ?? [];
        }
      );

      return { previousExercices, previousHistory };
    },
    onError: (error, _variables, context) => {
      // ⚡ ROLLBACK: Restaurer les données précédentes en cas d'erreur
      // C'est critique pour éviter que l'UI reste dans un état optimiste incorrect
      if (context?.previousExercices) {
        context.previousExercices.forEach(([queryKey, data]) => {
          if (data !== undefined) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      if (context?.previousHistory) {
        context.previousHistory.forEach(([queryKey, data]) => {
          if (data !== undefined) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      
      // Log l'erreur pour le debugging
      console.error('Erreur lors de la complétion de l\'exercice:', error);
    },
    onSuccess: (data) => {
      const wasCompleted = exercice.completedToday ?? false;
      const updatedExercice: Exercice = {
        ...exercice,
        completed: data.completed,
        completedToday: data.completedToday ?? false,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        weeklyCompletions: data.weeklyCompletions || [],
      };

      if (!wasCompleted && updatedExercice.completedToday) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }

      onCompleted?.(updatedExercice);

      queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'history' });
    },
  });

  const handleComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (userId) {
        mutate();
      }
    },
    [userId, mutate]
  );

  return {
    handleComplete,
    isCompleting: isPending,
    showSuccess,
  };
}
