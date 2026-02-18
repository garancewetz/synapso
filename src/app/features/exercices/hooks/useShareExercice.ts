import { useCallback } from 'react';
import type { Exercice } from '@/app/types';
import { shareExerciceAsText } from '@/app/utils/share';

export function useShareExercice(exercice: Exercice) {
  const handleShare = useCallback(async () => {
    await shareExerciceAsText(exercice);
  }, [exercice]);

  return { handleShare };
}
