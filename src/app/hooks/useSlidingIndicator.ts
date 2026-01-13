import { useRef, useState, useEffect } from 'react';
import type { MutableRefObject } from 'react';

type Direction = 'horizontal' | 'vertical';

type UseSlidingIndicatorReturn = {
  itemsRef: MutableRefObject<(HTMLElement | null)[]>;
  indicatorStyle: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
  };
  isReady: boolean;
};

/**
 * Hook pour gérer l'animation de l'indicateur qui glisse vers l'élément actif
 * @param activeIndex - L'index de l'élément actuellement actif
 * @param direction - La direction de l'animation ('horizontal' ou 'vertical')
 * @param dependencies - Dépendances supplémentaires pour recalculer la position
 * @returns Les références des éléments, le style de l'indicateur et un flag de prêt
 */
export function useSlidingIndicator(
  activeIndex: number,
  direction: Direction = 'horizontal',
  dependencies: unknown[] = []
): UseSlidingIndicatorReturn {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [indicatorSize, setIndicatorSize] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (activeIndex === -1) {
      setIsReady(false);
      return;
    }

    const setPosition = () => {
      const currentElement = itemsRef.current[activeIndex];
      if (!currentElement) {
        return;
      }

      if (direction === 'horizontal') {
        setIndicatorPosition(currentElement.offsetLeft);
        setIndicatorSize(currentElement.offsetWidth);
      } else {
        setIndicatorPosition(currentElement.offsetTop);
        setIndicatorSize(currentElement.offsetHeight);
      }
      
      setIsReady(true);
    };

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
    const rafId = requestAnimationFrame(setPosition);

    // Recalculer au redimensionnement
    window.addEventListener('resize', setPosition);
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', setPosition);
    };
    // Les dépendances dynamiques sont intentionnelles ici pour permettre des dépendances personnalisées
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, direction, ...dependencies]);

  const indicatorStyle =
    direction === 'horizontal'
      ? { left: indicatorPosition, width: indicatorSize }
      : { top: indicatorPosition, height: indicatorSize };

  return { itemsRef, indicatorStyle, isReady };
}

