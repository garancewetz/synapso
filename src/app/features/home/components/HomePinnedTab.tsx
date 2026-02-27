import { memo, useCallback } from 'react';
import { ExerciceCard } from '@/app/features/exercices';
import { ProgressCard } from '@/app/features/historique';
import { JournalNoteCard } from '@/app/features/journal';
import { BookmarkIcon } from '@/app/components/ui/icons';
import type { Exercice } from '@/app/types/exercice';
import type { Progress } from '@/app/types/progress';
import type { JournalNote } from '@/app/types/journal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/lib/api-queries';

type Props = {
  pinnedExercices: Exercice[];
  pinnedProgress: Progress[];
  pinnedNotes?: JournalNote[];
  onEdit?: (id: number) => void;
  onEditProgress?: (progress: Progress) => void;
  onShareProgress?: (progress: Progress) => void;
  onCompleted?: (updatedExercice: Exercice) => void;
  onArchive?: (updatedExercice: Exercice) => void;
  onNoteUpdated?: () => void;
};

export const HomePinnedTab = memo(function HomePinnedTab({
  pinnedExercices,
  pinnedProgress,
  pinnedNotes = [],
  onEdit,
  onEditProgress,
  onShareProgress,
  onCompleted,
  onArchive,
  onNoteUpdated,
}: Props) {
  const queryClient = useQueryClient();

  const handlePinProgress = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.progress.all,
      refetchType: 'active',
    });
  }, [queryClient]);

  const handleNoteUpdated = useCallback(() => {
    if (onNoteUpdated) {
      onNoteUpdated();
    }
  }, [onNoteUpdated]);

  const isEmpty = pinnedExercices.length === 0 && pinnedProgress.length === 0 && pinnedNotes.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookmarkIcon className="w-8 h-8 text-gray-300 mb-3" filled={false} />
        <p className="text-sm text-gray-500">
          Aucun élément épinglé.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Utilise le menu d&apos;un exercice, progrès ou note pour l&apos;épingler.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pinnedExercices.length > 0 && (
        <section aria-labelledby="pinned-exercices-heading">
          <h2 id="pinned-exercices-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Exercices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedExercices.map(ex => (
              <ExerciceCard
                key={`ex-${ex.id}`}
                exercice={ex}
                onEdit={onEdit}
                onCompleted={onCompleted}
                onArchive={onArchive}
              />
            ))}
          </div>
        </section>
      )}
      {pinnedProgress.length > 0 && (
        <section aria-labelledby="pinned-progress-heading">
          <h2 id="pinned-progress-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Progrès
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedProgress.map(progress => (
              <ProgressCard
                key={`progress-${progress.id}`}
                progress={progress}
                onEdit={onEditProgress}
                onShare={onShareProgress}
                onPin={handlePinProgress}
              />
            ))}
          </div>
        </section>
      )}
      {pinnedNotes.length > 0 && (
        <section aria-labelledby="pinned-notes-heading">
          <h2 id="pinned-notes-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Notes épinglées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedNotes.map(note => (
              <JournalNoteCard
                key={`note-${note.id}`}
                note={note}
                onUpdated={handleNoteUpdated}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
});
