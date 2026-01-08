import { useMemo } from 'react';
import { isOrthophonieVictory } from '@/app/utils/victory.utils';
import type { Victory } from '@/app/types';

type VictoryStats = {
  physicalVictories: Victory[];
  victoryDates: Set<string>;
  victoryCountByDate: Map<string, number>;
  totalVictories: number;
  totalPhysicalVictories: number;
  totalOrthoVictories: number;
};

/**
 * Hook personnalisé pour calculer les statistiques des victoires
 * Centralise la logique de filtrage et de comptage des victoires
 */
export function useVictoryStats(victories: Victory[]): VictoryStats {
  // Filtrer les victoires physiques uniquement (pas orthophonie)
  const physicalVictories = useMemo(() => {
    return victories.filter(v => !isOrthophonieVictory(v.emoji));
  }, [victories]);

  // Dates des victoires physiques pour afficher les étoiles
  const victoryDates = useMemo(() => {
    return new Set(physicalVictories.map(v => v.createdAt.split('T')[0]));
  }, [physicalVictories]);

  // Comptage des victoires physiques par jour
  const victoryCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    physicalVictories.forEach(v => {
      const date = v.createdAt.split('T')[0];
      counts.set(date, (counts.get(date) || 0) + 1);
    });
    return counts;
  }, [physicalVictories]);

  // Statistiques totales
  const totalVictories = victories.length;
  const totalPhysicalVictories = physicalVictories.length;
  const totalOrthoVictories = totalVictories - totalPhysicalVictories;

  return {
    physicalVictories,
    victoryDates,
    victoryCountByDate,
    totalVictories,
    totalPhysicalVictories,
    totalOrthoVictories,
  };
}

