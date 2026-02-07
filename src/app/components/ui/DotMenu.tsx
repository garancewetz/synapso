'use client';

import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { DotsIcon } from './icons';
import { Button } from './Button';
import { DotMenuActions } from './DotMenuActions';
import { useDotMenuActions } from '@/app/hooks/ui/useDotMenuActions';
import { useDropdownPosition } from '@/app/hooks/ui/useDropdownPosition';

type Props = {
  onArchive?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  isArchived?: boolean;
  className?: string;
};

/**
 * Menu à 3 points (dots) avec dropdown pour les actions sur un exercice
 * Actions disponibles : Archiver/Désarchiver, Modifier, Partager
 * 
 * Le dropdown suit le bouton lors du scroll et se ferme automatiquement après un délai
 */
export function DotMenu({ 
  onArchive, 
  onEdit, 
  onShare, 
  isArchived = false,
  className = ''
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemCount = [onArchive, onEdit, onShare].filter(Boolean).length;

  const {
    isOpen,
    setIsOpen,
    handleToggle,
    handleAction,
    handleKeyDown,
    hasActions,
  } = useDotMenuActions({ onArchive, onEdit, onShare });

  const { dropdownStyle } = useDropdownPosition({
    isOpen,
    buttonRef,
    dropdownRef,
    itemCount,
    onClose: () => setIsOpen(false),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
          buttonRef.current?.focus();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, setIsOpen]);

  if (!hasActions) {
    return null;
  }

  const dropdownContent = isOpen && dropdownStyle && (
    <div
      ref={dropdownRef}
      className={clsx(
        'fixed z-50',
        'bg-white rounded-lg shadow-lg border border-gray-200',
        'min-w-[160px] py-1',
        'overflow-hidden'
      )}
      style={dropdownStyle}
      role="menu"
      aria-orientation="vertical"
    >
      <DotMenuActions
        onArchive={onArchive}
        onEdit={onEdit}
        onShare={onShare}
        isArchived={isArchived}
        onActionClick={handleAction}
        variant="dropdown"
      />
    </div>
  );

  return (
    <>
      <div ref={menuRef} className={clsx('relative', className)}>
        <Button
          ref={buttonRef}
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

      {typeof window !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}
