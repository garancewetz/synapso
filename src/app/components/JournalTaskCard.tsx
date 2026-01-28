'use client';

import { useCallback, memo } from 'react';
import { TouchLink } from '@/app/components/TouchLink';
import { BaseCard, CompleteButton, Button, Badge } from '@/app/components/ui';
import { EditIcon } from '@/app/components/ui/icons';
import { JOURNAL_ACCENT_COLOR } from '@/app/constants/journal.constants';
import type { JournalTask } from '@/app/types';

type Props = {
  task: JournalTask;
  onCompletedToggle: (id: number, currentCompleted: boolean) => Promise<void>;
  isUpdating: boolean;
};

/**
 * Composant pour afficher une tâche du journal
 * Bande violette par défaut, badge "Fait" en vert quand complétée
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
const JournalTaskCard = memo(function JournalTaskCard({ 
  task, 
  onCompletedToggle, 
  isUpdating 
}: Props) {
  const handleCompletedClick = useCallback(() => {
    onCompletedToggle(task.id, task.completed);
  }, [onCompletedToggle, task.id, task.completed]);

  return (
    <BaseCard as="li">
      <BaseCard.Accent color={JOURNAL_ACCENT_COLOR} />
      <BaseCard.Content>
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
                {task.title}
              </div>
            </div>
            {/* Badge fait */}
            {task.completed && (
              <Badge 
                variant="completed"
              >
                Fait
              </Badge>
            )}
          </div>
        </div>
        <BaseCard.Footer>
          <div className="flex items-center gap-2 w-full">
            <TouchLink href={`/journal/tasks/edit/${task.id}`}>
              <Button
                iconOnly
                title="Modifier"
                aria-label="Modifier la tâche"
              >
                <EditIcon className="w-4 h-4" />
              </Button>
            </TouchLink>
            <div className="flex-1 min-w-0">
              <CompleteButton
                onClick={handleCompletedClick}
                isCompleted={task.completed}
                variant="task"
                isLoading={isUpdating}
                className="w-full"
              />
            </div>
          </div>
        </BaseCard.Footer>
      </BaseCard.Content>
    </BaseCard>
  );
});

export { JournalTaskCard };

