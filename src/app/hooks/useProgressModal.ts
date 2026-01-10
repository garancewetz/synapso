import { useState, useCallback } from 'react';
import type { Progress } from '@/app/types';

type UseProgressModalReturn = {
  isOpen: boolean;
  progressToEdit: Progress | null;
  openForCreate: () => void;
  openForEdit: (progress: Progress) => void;
  close: () => void;
};

/**
 * Hook pour gérer l'état de la modale de progrès (création et édition)
 */
export function useProgressModal(): UseProgressModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [progressToEdit, setProgressToEdit] = useState<Progress | null>(null);

  const openForCreate = useCallback(() => {
    setProgressToEdit(null);
    setIsOpen(true);
  }, []);

  const openForEdit = useCallback((progress: Progress) => {
    setProgressToEdit(progress);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setProgressToEdit(null);
  }, []);

  return {
    isOpen,
    progressToEdit,
    openForCreate,
    openForEdit,
    close,
  };
}

