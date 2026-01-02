import { useState, useCallback } from 'react';
import type { Victory } from '@/app/types';

type UseVictoryModalReturn = {
  isOpen: boolean;
  victoryToEdit: Victory | null;
  openForCreate: () => void;
  openForEdit: (victory: Victory) => void;
  close: () => void;
};

/**
 * Hook pour gérer l'état de la modale de victoire (création et édition)
 */
export function useVictoryModal(): UseVictoryModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [victoryToEdit, setVictoryToEdit] = useState<Victory | null>(null);

  const openForCreate = useCallback(() => {
    setVictoryToEdit(null);
    setIsOpen(true);
  }, []);

  const openForEdit = useCallback((victory: Victory) => {
    setVictoryToEdit(victory);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setVictoryToEdit(null);
  }, []);

  return {
    isOpen,
    victoryToEdit,
    openForCreate,
    openForEdit,
    close,
  };
}

