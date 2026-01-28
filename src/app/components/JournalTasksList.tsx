'use client';

import { useState } from 'react';
import { ViewAllLink } from '@/app/components/ui/ViewAllLink';
import { JournalTaskCard } from '@/app/components/JournalTaskCard';
import { useJournalTasks } from '@/app/hooks/useJournalTasks';

type Props = {
  onCompletedChange?: () => void;
  limit?: number;
};

export function JournalTasksList({ onCompletedChange, limit }: Props) {
  const { tasks, refetch: refetchTasks } = useJournalTasks();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleCompletedToggle = async (id: number, currentCompleted: boolean) => {
    setIsUpdating(id);
    try {
      const response = await fetch(`/api/journal/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ completed: !currentCompleted }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      refetchTasks();
      if (onCompletedChange) {
        onCompletedChange();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Garder l'ordre original des tâches (pas de tri)
  const displayedTasks = limit ? tasks.slice(0, limit) : tasks;
  const hasMoreTotal = limit && tasks.length > limit;

  return (
    <div>
      {displayedTasks.length > 0 ? (
        <>
          <ul className="space-y-3">
            {displayedTasks.map(task => (
              <JournalTaskCard
                key={task.id}
                task={task}
                onCompletedToggle={handleCompletedToggle}
                isUpdating={isUpdating === task.id}
              />
            ))}
          </ul>
          {limit && hasMoreTotal && (
            <div className="mt-4">
              <ViewAllLink 
                href="/journal/tasks"
                label="Voir toutes les tâches"
                emoji="📔"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Aucune tâche pour le moment
        </div>
      )}
    </div>
  );
}

export function useJournalTasksCount() {
  const { tasks } = useJournalTasks();
  return tasks.length;
}

