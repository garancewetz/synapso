import { useState, useCallback } from 'react';

type UseDotMenuActionsProps = {
  onArchive?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
};

type UseDotMenuActionsReturn = {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleToggle: (e: React.MouseEvent) => void;
  handleAction: (action: (() => void) | undefined) => (e?: React.MouseEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  hasActions: boolean;
};

/**
 * Hook pour gérer les actions communes du DotMenu et DotMenuBottomSheet
 * Factorise la logique de toggle, actions et gestion du clavier
 */
export function useDotMenuActions({
  onArchive,
  onEdit,
  onShare,
}: UseDotMenuActionsProps): UseDotMenuActionsReturn {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const handleAction = useCallback((action: (() => void) | undefined) => {
    return (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setIsOpen(false);
      if (action) {
        action();
      }
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(prev => !prev);
    }
  }, []);

  const hasActions = Boolean(onArchive || onEdit || onShare);

  return {
    isOpen,
    setIsOpen,
    handleToggle,
    handleAction,
    handleKeyDown,
    hasActions,
  };
}
