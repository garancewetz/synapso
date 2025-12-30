import { useEffect } from 'react';

/**
 * Hook pour bloquer le scroll du body quand une modale est ouverte
 * Utilise une approche simple avec overflow: hidden sur le html
 * 
 * @param isLocked - Si true, le scroll du body est désactivé
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    // Sauvegarder le style original
    const originalOverflow = document.documentElement.style.overflow;
    
    // Bloquer le scroll sur html (pas body) pour éviter le saut
    document.documentElement.style.overflow = 'hidden';

    return () => {
      // Restaurer le style original
      document.documentElement.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}
