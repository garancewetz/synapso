import { memo } from 'react';
import { ExerciceCard } from '@/app/features/exercices';
import { BookmarkIcon } from '@/app/components/ui/icons';
import type { Exercice } from '@/app/types/exercice';

type Props = {
  pinnedExercices: Exercice[];
  onEdit?: (id: number) => void;
  onCompleted?: (updatedExercice: Exercice) => void;
  onArchive?: (updatedExercice: Exercice) => void;
};

export const HomeKineTab = memo(function HomeKineTab({ pinnedExercices, onEdit, onCompleted, onArchive }: Props) {
  if (pinnedExercices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookmarkIcon className="w-8 h-8 text-gray-300 mb-3" filled={false} />
        <p className="text-sm text-gray-500">
          Aucun exercice marqué pour le kiné.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Utilise le menu d&apos;un exercice pour le marquer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pinnedExercices.map(ex => (
        <ExerciceCard
          key={ex.id}
          exercice={ex}
          onEdit={onEdit}
          onCompleted={onCompleted}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
});
