'use client';

import { useMemo } from 'react';
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { Badge } from '@/app/components/ui';
import { getEquipmentIcon } from '@/app/constants/equipment.constants';

type Props = {
  exercice: Exercice;
};

export function ExerciceCardTags({ exercice }: Props) {
  const categoryStyle = useMemo(
    () => CATEGORY_COLORS[exercice.category],
    [exercice.category]
  );

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {exercice.bodyparts && exercice.bodyparts.length > 0 &&
        exercice.bodyparts.map((bodypart) => (
          <Badge key={bodypart} className={categoryStyle.tag}>
            {bodypart}
          </Badge>
        ))
      }
      
      {exercice.equipments && exercice.equipments.length > 0 &&
        exercice.equipments.map((equipment: string) => (
          <Badge 
            key={equipment}
            variant="equipment" 
            icon={getEquipmentIcon(equipment)}
          >
            {equipment}
          </Badge>
        ))
      }
      
      {exercice.workout.series && exercice.workout.series !== '1' && (
        <Badge variant="workout">
          {exercice.workout.series} séries
        </Badge>
      )}
      
      {exercice.workout.repeat && (
        <Badge variant="workout">
          {exercice.workout.repeat}x
        </Badge>
      )}
      
      {exercice.workout.duration && (
        <Badge variant="workout">
          {exercice.workout.duration}
        </Badge>
      )}
    </div>
  );
}

