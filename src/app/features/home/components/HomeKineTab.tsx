import { memo, useCallback } from 'react';
import { ExerciceCard } from '@/app/features/exercices';
import { ProgressCard } from '@/app/features/historique';
import { BookmarkIcon } from '@/app/components/ui/icons';
import type { Exercice } from '@/app/types/exercice';
import type { Progress } from '@/app/types/progress';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/lib/api-queries';

type Props = {
  pinnedExercices: Exercice[];
  pinnedProgress: Progress[];
  onEdit?: (id: number) => void;
  onCompleted?: (updatedExercice: Exercice) => void;
  onArchive?: (updatedExercice: Exercice) => void;
};

export const HomeKineTab = memo(function HomeKineTab({
  pinnedExercices,
  pinnedProgress,
  onEdit,
  onCompleted,
  onArchive,
}: Props) {
  const queryClient = useQueryClient();

  const handlePinProgress = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.progress.all,
      refetchType: 'active',
    });
  }, [queryClient]);

  const isEmpty = pinnedExercices.length === 0 && pinnedProgress.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookmarkIcon className="w-8 h-8 text-gray-300 mb-3" filled={false} />
        <p className="text-sm text-gray-500">
          Aucun exercice ou progrès marqué pour le kiné.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Utilise le menu d&apos;un exercice ou progrès pour le marquer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pinnedExercices.map(ex => (
        <ExerciceCard
          key={`ex-${ex.id}`}
          exercice={ex}
          onEdit={onEdit}
          onCompleted={onCompleted}
          onArchive={onArchive}
        />
      ))}
      {pinnedProgress.map(progress => (
        <ProgressCard
          key={`progress-${progress.id}`}
          progress={progress}
          onPin={handlePinProgress}
        />
      ))}
    </div>
  );
});
