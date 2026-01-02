import { useMemo } from 'react';
import { getVictoryBadges } from '@/app/utils/victory.utils';
import type { Victory } from '@/app/types';

/**
 * Hook pour calculer les badges d'une victoire
 * Mémorise les calculs pour éviter les recalculs inutiles
 */
export function useVictoryBadges(victory: Victory) {
  return useMemo(
    () => getVictoryBadges(victory.emoji),
    [victory.emoji]
  );
}

