'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Exercice } from '@/app/types';
import { useArchiveExercice } from './useArchiveExercice';
import { usePinExercice } from './usePinExercice';

type UseExerciceCardActionsOptions = {
  exercice: Exercice;
  userId: number;
  onEdit?: (id: number) => void;
  onCompleted?: (updatedExercice: Exercice) => void;
  onArchive?: (updatedExercice: Exercice) => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
};

export function useExerciceCardActions({
  exercice,
  userId,
  onEdit,
  onCompleted,
  onArchive,
  cardRef,
}: UseExerciceCardActionsOptions) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { archiveExercice, isArchiving } = useArchiveExercice();
  const { handlePin, isPinning } = usePinExercice({
    exercice,
    userId,
    onCompleted,
  });

  // Scroll la carte dans le viewport quand le menu d'actions s'ouvre
  useEffect(() => {
    if (!isActionsOpen) return;

    const timeoutId = window.setTimeout(() => {
      const element = cardRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.bottom <= viewportHeight) return;

      const documentHeight = document.documentElement.scrollHeight;
      const currentScrollTop = window.scrollY || window.pageYOffset;
      const targetTop = Math.min(
        Math.max(currentScrollTop + rect.top - viewportHeight * 0.3, 0),
        documentHeight - viewportHeight
      );

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [isActionsOpen, cardRef]);

  const handleEdit = useCallback(() => {
    setIsActionsOpen(false);
    if (onEdit) onEdit(exercice.id);
  }, [onEdit, exercice.id]);

  const handleArchive = useCallback(async () => {
    const updated = await archiveExercice(exercice.id, !exercice.archived);
    if (updated && onArchive) onArchive(updated);
    setIsActionsOpen(false);
  }, [archiveExercice, exercice.id, exercice.archived, onArchive]);

  const handlePinClick = useCallback(async () => {
    await handlePin();
    setIsActionsOpen(false);
  }, [handlePin]);

  const handleShareClick = useCallback(() => {
    setIsShareModalOpen(true);
    setIsActionsOpen(false);
  }, []);

  const toggleActions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(prev => !prev);
  }, []);

  return {
    isActionsOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    isArchiving,
    isPinning,
    handleEdit,
    handleArchive,
    handlePinClick,
    handleShareClick,
    toggleActions,
  };
}
