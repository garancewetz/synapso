'use client';

import clsx from 'clsx';
import { DotsIcon } from './icons';
import { Button } from './Button';
import { BottomSheetModal } from './BottomSheetModal';
import { DotMenuActions } from './DotMenuActions';
import { useDotMenuActions } from '@/app/hooks/ui/useDotMenuActions';

type Props = {
  onArchive?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  isArchived?: boolean;
  className?: string;
};

/**
 * Alternative mobile-first au DotMenu utilisant un Bottom Sheet
 * Plus accessible et intuitif sur mobile que le dropdown classique
 * 
 * Utilise BottomSheetModal pour une expérience tactile optimale
 */
export function DotMenuBottomSheet({ 
  onArchive, 
  onEdit, 
  onShare, 
  isArchived = false,
  className = ''
}: Props) {
  const {
    isOpen,
    setIsOpen,
    handleToggle,
    handleAction,
    handleKeyDown,
    hasActions,
  } = useDotMenuActions({ onArchive, onEdit, onShare });

  if (!hasActions) {
    return null;
  }

  return (
    <>
      <div className={clsx('relative', className)}>
        <Button
          iconOnly
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-label="Ouvrir le menu d'actions"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <DotsIcon className="w-5 h-5" />
        </Button>
      </div>

      <BottomSheetModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        showFooterClose={false}
      >
        <div className="px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions
          </h2>
          
          <div className="space-y-2">
            <DotMenuActions
              onArchive={onArchive}
              onEdit={onEdit}
              onShare={onShare}
              isArchived={isArchived}
              onActionClick={handleAction}
              variant="bottomsheet"
            />
          </div>
        </div>
      </BottomSheetModal>
    </>
  );
}
