import { useState, useEffect, useCallback } from 'react';

type UseDeleteConfirmationOptions = {
  /** Délai en ms avant de reset la confirmation (0 = pas de reset auto) */
  resetDelay?: number;
};

type UseDeleteConfirmationReturn = {
  showConfirm: boolean;
  isDeleting: boolean;
  handleClick: (onDelete: () => Promise<void>) => Promise<void>;
  reset: () => void;
};

/**
 * Hook pour gérer la confirmation de suppression avec double-clic
 * - 1er clic : affiche la confirmation
 * - 2ème clic : exécute la suppression
 * - Reset automatique après un délai (optionnel)
 */
export function useDeleteConfirmation(
  options: UseDeleteConfirmationOptions = {}
): UseDeleteConfirmationReturn {
  const { resetDelay = 3000 } = options;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset automatique de la confirmation après un délai
  useEffect(() => {
    if (showConfirm && resetDelay > 0) {
      const timer = setTimeout(() => {
        setShowConfirm(false);
      }, resetDelay);
      return () => clearTimeout(timer);
    }
  }, [showConfirm, resetDelay]);

  const handleClick = useCallback(async (onDelete: () => Promise<void>) => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }, [showConfirm]);

  const reset = useCallback(() => {
    setShowConfirm(false);
    setIsDeleting(false);
  }, []);

  return {
    showConfirm,
    isDeleting,
    handleClick,
    reset,
  };
}

