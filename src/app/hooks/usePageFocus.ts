import { useEffect, RefObject } from 'react';
import { FOCUS_DELAYS } from '@/app/constants/accessibility.constants';
import {
  getFocusableElements,
  isFocusable,
  isInClosedMenu,
} from '@/app/utils/accessibility.utils';

interface UsePageFocusOptions {
  /** Référence vers l'élément à focuser en priorité */
  targetRef?: RefObject<HTMLElement>;
  /** Sélecteur CSS pour trouver l'élément à focuser */
  selector?: string;
  /** Active ou désactive le hook */
  enabled?: boolean;
  /** Exclure les éléments du menu (par défaut: true) */
  excludeMenu?: boolean;
}

/**
 * Hook personnalisé pour gérer le focus initial sur une page
 * 
 * Place automatiquement le focus sur le premier élément focusable approprié
 * lors du chargement d'une nouvelle page. Conforme aux recommandations WCAG 2.1
 * pour la gestion du focus lors des changements de contexte.
 * 
 * @param options - Options de configuration
 * 
 * @example
 * ```tsx
 * // Focuser automatiquement le premier élément focusable
 * usePageFocus();
 * 
 * // Focuser un élément spécifique
 * const inputRef = useRef<HTMLInputElement>(null);
 * usePageFocus({ targetRef: inputRef });
 * 
 * // Focuser via un sélecteur
 * usePageFocus({ selector: 'input[type="text"]' });
 * ```
 */
export function usePageFocus(options: UsePageFocusOptions = {}) {
  const {
    targetRef,
    selector,
    enabled = true,
    excludeMenu = true,
  } = options;
  useEffect(() => {
    if (!enabled) return;

    const focusElement = () => {
      try {
        // Si une ref est fournie, l'utiliser en priorité
        if (targetRef?.current && isFocusable(targetRef.current)) {
          targetRef.current.focus();
          return;
        }

        // Si un sélecteur est fourni, l'utiliser
        if (selector) {
          const element = document.querySelector<HTMLElement>(selector);
          if (element && isFocusable(element)) {
            // Vérifier si on doit exclure le menu
            if (!excludeMenu || !isInClosedMenu(element)) {
              element.focus();
              return;
            }
          }
        }

        // Sinon, trouver le premier élément focusable de la page
        const allFocusable = getFocusableElements(document);

        // Trouver le premier élément focusable qui n'est pas dans le menu
        const firstFocusable = allFocusable.find((el) => {
          // Exclure les éléments du menu si demandé
          if (excludeMenu && isInClosedMenu(el)) {
            return false;
          }

          // Exclure le bouton menu lui-même
          if (
            el.getAttribute('aria-label') === 'Ouvrir le menu' ||
            el.getAttribute('aria-controls') === 'main-menu'
          ) {
            return false;
          }

          return true;
        });

        if (firstFocusable) {
          firstFocusable.focus();
        }
      } catch (error) {
        // Ignorer les erreurs de focus silencieusement
        console.warn('Erreur lors du focus initial de la page:', error);
      }
    };

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est rendu
    requestAnimationFrame(() => {
      setTimeout(focusElement, FOCUS_DELAYS.TABINDEX_UPDATE);
    });
  }, [targetRef, selector, enabled, excludeMenu]);
}

