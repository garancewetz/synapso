import { useCallback } from 'react';

/**
 * Sur mobile (surtout iOS Safari), quand la page a un scroll inertiel en cours,
 * le premier tap sur un élément fixe est interprété comme "arrêt du scroll"
 * et le click n'est pas déclenché.
 *
 * Ce hook retourne un handler onTouchStart qui stoppe le scroll inertiel
 * immédiatement, permettant au click de se déclencher sur le même tap.
 */
export function useStopScrollOnTouch() {
  return useCallback(() => {
    // Stopper le scroll inertiel en forçant la position actuelle
    // Cela n'a aucun effet visuel mais coupe le momentum
    window.scrollTo(window.scrollX, window.scrollY);
  }, []);
}
