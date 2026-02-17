import { useEffect } from 'react';

/**
 * Compteur partagé pour gérer plusieurs locks simultanés.
 * Quand NavBar + BottomSheet + Lightbox verrouillent en même temps,
 * le scroll n'est restauré que lorsque TOUS ont déverrouillé.
 */
let lockCount = 0;

// Nettoyage au chargement du module (HMR ou refresh)
// Garantit qu'un overflow:hidden résiduel ne reste pas coincé
if (typeof document !== 'undefined') {
  document.documentElement.style.overflow = '';
}

/**
 * Hook pour bloquer le scroll du body quand une modale est ouverte
 * Utilise un compteur pour éviter les race conditions entre composants
 *
 * @param isLocked - Si true, le scroll du body est désactivé
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.documentElement.style.overflow = '';
      }
    };
  }, [isLocked]);
}
