import { useState, useRef, useEffect, useCallback } from 'react';

const SCROLL_CLOSE_DELAY = 2000;
const ITEM_HEIGHT_ESTIMATE = 50;
const GAP = 4;
const MIN_MARGIN = 8;
const GRID_ROW_HEIGHT = 56;

type UseDropdownPositionProps = {
  isOpen: boolean;
  buttonRef: React.RefObject<HTMLElement | null>;
  dropdownRef: React.RefObject<HTMLElement | null>;
  itemCount: number;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
};

type DropdownStyle = {
  top: number;
  left: number;
  width?: number;
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
  containerRef,
}: UseDropdownPositionProps): UseDropdownPositionReturn {
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownStyle, setDropdownStyle] = useState<DropdownStyle>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updatePositionRef = useRef<number | null>(null);

  const calculateEstimatedHeight = useCallback(() => {
    if (containerRef?.current) {
      return GRID_ROW_HEIGHT + GAP;
    }
    return itemCount * ITEM_HEIGHT_ESTIMATE + GAP;
  }, [itemCount, containerRef]);

  const updateDropdownPosition = useCallback(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const containerRect = containerRef?.current?.getBoundingClientRect();

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

      const style: DropdownStyle = containerRect
        ? { top, left: containerRect.left, width: containerRect.width }
        : { top, left: buttonRect.left };
      setPosition(newPosition);
      setDropdownStyle(style);
      return;
    }

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    let top: number;
    let left: number;
    let width: number | undefined;
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

    if (containerRect) {
      left = containerRect.left;
      width = containerRect.width;
    } else {
      left = buttonRect.left;
      if (left + dropdownRect.width > window.innerWidth) {
        left = window.innerWidth - dropdownRect.width - MIN_MARGIN;
      }
      if (left < MIN_MARGIN) {
        left = MIN_MARGIN;
      }
    }

    if (newPosition !== position) {
      setPosition(newPosition);
    }
    setDropdownStyle(width !== undefined ? { top, left, width } : { top, left });
  }, [isOpen, position, buttonRef, dropdownRef, containerRef, calculateEstimatedHeight]);

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
      const containerRect = containerRef?.current?.getBoundingClientRect();
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

      const initialStyle: DropdownStyle = containerRect
        ? { top, left: containerRect.left, width: containerRect.width }
        : { top, left: buttonRect.left };
      setPosition(initialPosition);
      setDropdownStyle(initialStyle);

      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
    } else if (!isOpen) {
      setDropdownStyle(null);
    }
  }, [isOpen, buttonRef, containerRef, calculateEstimatedHeight, updateDropdownPosition]);

  return {
    position,
    dropdownStyle,
  };
}
