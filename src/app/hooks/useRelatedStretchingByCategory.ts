import { useMemo } from 'react';
import { useExercices } from './useExercices';
import { CATEGORY_ORDER, AVAILABLE_BODYPARTS, BODYPART_TO_CATEGORY } from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

export function useRelatedStretchingByCategory() {
  const { exercices: stretchingExercices } = useExercices({
    category: 'STRETCHING',
  });

  const relatedStretchingByCategory = useMemo(() => {
    const counts: Record<ExerciceCategory, number> = {
      UPPER_BODY: 0,
      CORE: 0,
      LOWER_BODY: 0,
      STRETCHING: 0,
    };
    
    CATEGORY_ORDER.forEach((category) => {
      if (category === 'STRETCHING') {
        return;
      }
      
      const categoryBodyparts = AVAILABLE_BODYPARTS.filter(
        bp => BODYPART_TO_CATEGORY[bp] === category
      );
      
      counts[category] = stretchingExercices.filter(ex =>
        ex.bodyparts.some(bp => categoryBodyparts.includes(bp as typeof AVAILABLE_BODYPARTS[number]))
      ).length;
    });
    
    return counts;
  }, [stretchingExercices]);

  return { relatedStretchingByCategory };
}
