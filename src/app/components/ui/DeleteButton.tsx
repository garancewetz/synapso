'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';

type Props = {
  onDelete: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
  /** Délai en ms avant de reset la confirmation (0 = pas de reset auto) */
  resetDelay?: number;
};

/**
 * Bouton de suppression avec sécurité double-clic
 * - 1er clic : affiche la confirmation
 * - 2ème clic : exécute la suppression
 * - Reset automatique après un délai (optionnel)
 */
export function DeleteButton({
  onDelete,
  label = '🗑️ Supprimer',
  confirmLabel = '⚠️ Confirmer la suppression',
  disabled = false,
  className = '',
  resetDelay = 3000,
}: Props) {
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

  const handleClick = async () => {
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
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isDeleting}
      className={clsx(
        'w-full py-3 px-4 rounded-2xl font-semibold',
        'transition-all active:scale-[0.98] cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        showConfirm 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-red-50 text-red-600 hover:bg-red-100',
        className
      )}
    >
      {isDeleting ? (
        <span className="animate-spin">⏳</span>
      ) : showConfirm ? (
        confirmLabel
      ) : (
        label
      )}
    </button>
  );
}

