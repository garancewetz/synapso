import { useEffect, RefObject } from 'react';
import { FOCUS_DELAYS, KEYBOARD_KEYS } from '@/app/constants/accessibility.constants';
import { getFocusableElements } from '@/app/utils/accessibility.utils';

interface UseFocusTrapOptions {
  /** Élément à focuser initialement : 'first' (premier focusable) ou 'container' (le conteneur lui-même) */
  initialFocus?: 'first' | 'container';
  /** Restaurer le focus sur l'élément précédent quand le trap est désactivé */
  restoreFocus?: boolean;
  /** Référence vers l'élément sur lequel restaurer le focus */
  restoreFocusRef?: RefObject<HTMLElement | null>;
  /** Callback appelé quand la touche Escape est pressée */
  onEscape?: () => void;
}

/**
 * Hook personnalisé pour implémenter un trap focus dans un élément modal/dialog
 * 
 * Conforme aux recommandations WCAG 2.1 pour la gestion du focus dans les modals.
 * 
 * @param containerRef - Référence vers l'élément conteneur (modal, dialog, etc.)
 * @param isActive - Indique si le trap focus est actif
 * @param options - Options de configuration
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * 
 * useFocusTrap(modalRef, isOpen, {
 *   initialFocus: 'first',
 *   restoreFocus: true,
 *   restoreFocusRef: triggerRef,
 *   onEscape: () => setIsOpen(false),
 * });
 * ```
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  options: UseFocusTrapOptions = {}
) {
  const {
    initialFocus = 'first',
    restoreFocus = false,
    restoreFocusRef,
    onEscape,
  } = options;

  // Gérer le trap focus et la touche Escape
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) {
      // Si aucun élément focusable, focuser le conteneur s'il est focusable
      if (initialFocus === 'container' && container instanceof HTMLElement) {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
        }
        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              container.focus();
            } catch (error) {
              console.warn('Erreur lors du focus initial:', error);
            }
          }, FOCUS_DELAYS.DOM_UPDATE);
        });
      }
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus initial
    const focusInitial = () => {
      try {
        if (initialFocus === 'container' && container instanceof HTMLElement) {
          if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '-1');
          }
          container.focus();
        } else {
          firstFocusable.focus();
        }
      } catch (error) {
        console.warn('Erreur lors du focus initial:', error);
      }
    };

    requestAnimationFrame(() => {
      setTimeout(focusInitial, FOCUS_DELAYS.DOM_UPDATE);
    });

    /**
     * Gère la navigation au clavier pour maintenir le focus dans le conteneur
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Gérer la touche Escape
      if (e.key === KEYBOARD_KEYS.ESCAPE && onEscape) {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        return;
      }

      // Gérer uniquement la touche Tab
      if (e.key !== KEYBOARD_KEYS.TAB) return;

      const activeElement = document.activeElement as HTMLElement;

      // Tab sur le dernier élément → aller au premier
      if (!e.shiftKey && activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
        return;
      }

      // Shift+Tab sur le premier élément → aller au dernier
      if (e.shiftKey && activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
        return;
      }

      // Si le focus n'est pas dans le conteneur, le remettre sur le premier élément
      if (!container.contains(activeElement)) {
        e.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isActive, containerRef, initialFocus, onEscape]);

  // Restaurer le focus sur l'élément précédent quand le trap est désactivé
  useEffect(() => {
    if (!isActive && restoreFocus && restoreFocusRef?.current) {
      const timeoutId = setTimeout(() => {
        try {
          const activeElement = document.activeElement as HTMLElement;
          const container = containerRef.current;

          // Si le focus est encore dans le conteneur fermé, le restaurer
          if (container?.contains(activeElement) && restoreFocusRef.current) {
            restoreFocusRef.current.focus();
            return;
          }

          // Sinon, restaurer le focus seulement si ce n'est pas déjà ailleurs
          if (
            restoreFocusRef.current &&
            (document.activeElement === document.body ||
              !document.activeElement ||
              document.activeElement === document.documentElement)
          ) {
            restoreFocusRef.current.focus();
          }
        } catch (error) {
          // Ignorer les erreurs de focus
          console.warn('Erreur lors de la restauration du focus:', error);
        }
      }, FOCUS_DELAYS.RESTORE_FOCUS);

      return () => clearTimeout(timeoutId);
    }
  }, [isActive, restoreFocus, restoreFocusRef, containerRef]);
}

