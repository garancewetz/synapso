'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  isMenuOpen?: boolean;
};

/**
 * Composant Dropdown générique et accessible
 */
export function Dropdown({ trigger, children, align = 'left', className, isMenuOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as unknown as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as unknown as EventListener);
    };
  }, [isOpen]);

  // Fermer le dropdown quand le menu parent se ferme
  useEffect(() => {
    if (!isMenuOpen) {
      setIsOpen(false);
    }
  }, [isMenuOpen]);

  const tabIndex = isMenuOpen ? 0 : -1;

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={tabIndex}
        className="w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 rounded-xl cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border-2 border-gray-200 max-h-96 overflow-y-auto',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
}

