import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

type UseTouchNavigationOptions = {
  /** Callback appelé avant la navigation */
  onBeforeNavigate?: () => void;
  /** Callback appelé après la navigation */
  onAfterNavigate?: () => void;
};

/**
 * Hook pour gérer la navigation tactile optimisée pour mobile
 * Résout le problème du double-clic en utilisant onPointerDown
 * et en gérant correctement les événements touch
 */
export function useTouchNavigation(options: UseTouchNavigationOptions = {}) {
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const touchStartTimeRef = useRef<number | null>(null);

  const navigate = useCallback(
    (href: string) => {
      // Empêcher les navigations multiples rapides
      if (isNavigatingRef.current) {
        return;
      }

      isNavigatingRef.current = true;
      options.onBeforeNavigate?.();

      // Utiliser setTimeout pour permettre au navigateur de traiter l'événement
      setTimeout(() => {
        router.push(href);
        options.onAfterNavigate?.();
        
        // Réinitialiser après un court délai
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 300);
      }, 0);
    },
    [router, options]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, href: string) => {
      // Ne traiter que les événements de type touch ou mouse
      if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
        // Empêcher le comportement par défaut pour éviter le double-tap zoom
        if (e.pointerType === 'touch') {
          e.preventDefault();
        }
        
        touchStartTimeRef.current = Date.now();
        navigate(href);
      }
    },
    [navigate]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      // Si onPointerDown a déjà été appelé récemment, ignorer le click
      if (touchStartTimeRef.current && Date.now() - touchStartTimeRef.current < 300) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Pour les clics souris normaux, naviguer normalement
      navigate(href);
    },
    [navigate]
  );

  return {
    navigate,
    handlePointerDown,
    handleClick,
  };
}

