import { useState, useRef, useEffect, useCallback } from 'react';

const SCROLL_CLOSE_DELAY = 2000;
const ITEM_HEIGHT_ESTIMATE = 50;
const GAP = 4;
const MIN_MARGIN = 8;

type UseDropdownPositionProps = {
  isOpen: boolean;
  buttonRef: React.RefObject<HTMLElement | null>;
  dropdownRef: React.RefObject<HTMLElement | null>;
  itemCount: number;
  onClose: () => void;
};

type DropdownStyle = {
  top: number;
  left: number;
} | null;

type UseDropdownPositionReturn = {
  position: 'bottom' | 'top';
  dropdownStyle: DropdownStyle;
};

/**
 * Hook pour gérer le positionnement d'un dropdown
 * Calcule la position optimale et suit le scroll
 */
export function useDropdownPosition({
  isOpen,
  buttonRef,
  dropdownRef,
  itemCount,
  onClose,
}: UseDropdownPositionProps): UseDropdownPositionReturn {
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownStyle, setDropdownStyle] = useState<DropdownStyle>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updatePositionRef = useRef<number | null>(null);

  const calculateEstimatedHeight = useCallback(() => {
    return itemCount * ITEM_HEIGHT_ESTIMATE + GAP;
  }, [itemCount]);

  const updateDropdownPosition = useCallback(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();

    if (!dropdownRef.current) {
      const estimatedHeight = calculateEstimatedHeight();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top: number;
      let newPosition: 'bottom' | 'top' = 'bottom';

      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        newPosition = 'top';
        top = buttonRect.top - estimatedHeight - GAP;
      } else {
        top = buttonRect.bottom + GAP;
      }

      setPosition(newPosition);
      setDropdownStyle({ top, left: buttonRect.left });
      return;
    }

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    let top: number;
    let left: number;
    let newPosition: 'bottom' | 'top' = position;

    if (position === 'bottom' && spaceBelow < dropdownRect.height && spaceAbove > spaceBelow) {
      newPosition = 'top';
      top = buttonRect.top - dropdownRect.height - GAP;
    } else if (position === 'top' && spaceAbove < dropdownRect.height && spaceBelow > spaceAbove) {
      newPosition = 'bottom';
      top = buttonRect.bottom + GAP;
    } else if (position === 'bottom') {
      top = buttonRect.bottom + GAP;
    } else {
      top = buttonRect.top - dropdownRect.height - GAP;
    }

    left = buttonRect.left;

    if (left + dropdownRect.width > window.innerWidth) {
      left = window.innerWidth - dropdownRect.width - MIN_MARGIN;
    }
    if (left < MIN_MARGIN) {
      left = MIN_MARGIN;
    }

    if (newPosition !== position) {
      setPosition(newPosition);
    }
    setDropdownStyle({ top, left });
  }, [isOpen, position, buttonRef, dropdownRef, calculateEstimatedHeight]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (updatePositionRef.current) {
        cancelAnimationFrame(updatePositionRef.current);
      }

      updatePositionRef.current = requestAnimationFrame(() => {
        updateDropdownPosition();
      });

      scrollTimeoutRef.current = setTimeout(() => {
        onClose();
      }, SCROLL_CLOSE_DELAY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    const scrollableParents: Element[] = [];
    let parent = buttonRef.current?.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll'
      ) {
        scrollableParents.push(parent);
        parent.addEventListener('scroll', handleScroll, { passive: true });
      }
      parent = parent.parentElement;
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      scrollableParents.forEach(parent => {
        parent.removeEventListener('scroll', handleScroll);
      });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (updatePositionRef.current) {
        cancelAnimationFrame(updatePositionRef.current);
      }
    };
  }, [isOpen, updateDropdownPosition, onClose, buttonRef]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const estimatedHeight = calculateEstimatedHeight();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top: number;
      let initialPosition: 'bottom' | 'top' = 'bottom';

      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        initialPosition = 'top';
        top = buttonRect.top - estimatedHeight - GAP;
      } else {
        top = buttonRect.bottom + GAP;
      }

      setPosition(initialPosition);
      setDropdownStyle({ top, left: buttonRect.left });

      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
    } else if (!isOpen) {
      setDropdownStyle(null);
    }
  }, [isOpen, buttonRef, calculateEstimatedHeight, updateDropdownPosition]);

  return {
    position,
    dropdownStyle,
  };
}
