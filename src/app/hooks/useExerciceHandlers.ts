import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Exercice } from '@/app/types/exercice';

type UseExerciceHandlersOptions = {
  updateExercice: (exercice: Exercice) => void;
  fromPath?: string;
};

type UseExerciceHandlersReturn = {
  handleEditClick: (id: number) => void;
  handleCompleted: (updatedExercice: Exercice) => void;
};

/**
 * Hook pour gérer les handlers communs des exercices (édition, complétion)
 */
export function useExerciceHandlers({
  updateExercice,
  fromPath,
}: UseExerciceHandlersOptions): UseExerciceHandlersReturn {
  const router = useRouter();
  const pathname = usePathname();

  const handleEditClick = useCallback(
    (id: number) => {
      const from = fromPath || pathname;
      router.push(`/exercice/edit/${id}?from=${encodeURIComponent(from)}`);
    },
    [router, pathname, fromPath]
  );

  const handleCompleted = useCallback(
    (updatedExercice: Exercice) => {
      updateExercice(updatedExercice);
    },
    [updateExercice]
  );

  return {
    handleEditClick,
    handleCompleted,
  };
}

