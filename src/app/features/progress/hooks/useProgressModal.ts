import { useState, useCallback } from 'react';
import type { Progress } from '@/app/types';

type UseProgressModalReturn = {
  isOpen: boolean;
  progressToEdit: Progress | null;
  initialContent: string | undefined;
  initialEmoji: string | undefined;
  openForCreate: (initialContent?: string, initialEmoji?: string) => void;
  openForEdit: (progress: Progress) => void;
  close: () => void;
};

/**
 * Hook pour gérer l'état de la modale de progrès (création et édition)
 */
export function useProgressModal(): UseProgressModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [progressToEdit, setProgressToEdit] = useState<Progress | null>(null);
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined);
  const [initialEmoji, setInitialEmoji] = useState<string | undefined>(undefined);

  const openForCreate = useCallback((content?: string, emoji?: string) => {
    setProgressToEdit(null);
    setInitialContent(content);
    setInitialEmoji(emoji);
    setIsOpen(true);
  }, []);

  const openForEdit = useCallback((progress: Progress) => {
    setProgressToEdit(progress);
    setInitialContent(undefined);
    setInitialEmoji(undefined);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setProgressToEdit(null);
    setInitialContent(undefined);
    setInitialEmoji(undefined);
  }, []);

  return {
    isOpen,
    progressToEdit,
    initialContent,
    initialEmoji,
    openForCreate,
    openForEdit,
    close,
  };
}

