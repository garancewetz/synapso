import { useMemo } from 'react';
import { getProgressBadges } from '@/app/utils/progress.utils';
import type { Progress } from '@/app/types';

/**
 * Hook pour calculer les badges d'un progrès
 * Mémorise les calculs pour éviter les recalculs inutiles
 */
export function useProgressBadges(progress: Progress) {
  return useMemo(
    () => getProgressBadges(progress.emoji),
    [progress.emoji]
  );
}

