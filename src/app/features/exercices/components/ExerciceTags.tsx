import { Badge } from '@/app/components/ui';
import { TouchLink } from '@/app/components/TouchLink';
import type { Exercice } from '@/app/types';
import { getEquipmentIcon } from '@/app/constants/equipment.constants';

type Props = {
  exercice: Exercice;
  categoryStyle: {
    tag: string;
  };
};

export function ExerciceTags({ exercice, categoryStyle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {/* Bodyparts - couleur pâle de la catégorie */}
      {exercice.bodyparts?.length > 0 &&
        exercice.bodyparts.map((bodypart) => (
          <Badge key={bodypart} className={categoryStyle.tag}>
            {bodypart}
          </Badge>
        ))
      }
      
      {/* Séries */}
      {exercice.workout.series && exercice.workout.series !== '1' && (
        <Badge variant="workout">
          {exercice.workout.series} séries
        </Badge>
      )}
      
      {/* Répétitions */}
      {exercice.workout.repeat && (
        <Badge variant="workout">
          {exercice.workout.repeat}x
        </Badge>
      )}
      
      {/* Durée */}
      {exercice.workout.duration && (
        <Badge variant="workout">
          {exercice.workout.duration}
        </Badge>
      )}
      
      {/* Équipements - cliquables */}
      {exercice.equipments?.length > 0 &&
        exercice.equipments.map((equipment) => (
          <TouchLink
            key={equipment}
            href={`/exercices/all?equipments=${encodeURIComponent(equipment)}`}
            className="inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant="equipment" icon={getEquipmentIcon(equipment)}>
              {equipment}
            </Badge>
          </TouchLink>
        ))
      }
    </div>
  );
}

