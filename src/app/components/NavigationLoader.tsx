'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { InitialLoader } from './InitialLoader';

/**
 * Événement personnalisé émis par les pages quand elles sont prêtes
 * Les pages peuvent émettre cet événement pour indiquer qu'elles ont fini de charger
 */
const PAGE_READY_EVENT = 'page-ready';

/**
 * Composant qui affiche le loader lors des transitions de page
 * Surveille les changements de route et affiche le loader pendant la transition
 * Le loader disparaît quand la page émet l'événement 'page-ready' ou après un délai maximum
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);

  useEffect(() => {
    // Si le pathname change, c'est une navigation
    if (previousPathname !== null && previousPathname !== pathname) {
      setIsNavigating(true);
      
      // Écouter l'événement de page prête
      const handlePageReady = () => {
        setIsNavigating(false);
      };
      
      window.addEventListener(PAGE_READY_EVENT, handlePageReady);
      
      // Masquer le loader après un délai maximum (sécurité)
      const maxTimer = setTimeout(() => {
        setIsNavigating(false);
      }, 2000);
      
      return () => {
        window.removeEventListener(PAGE_READY_EVENT, handlePageReady);
        clearTimeout(maxTimer);
      };
    }
    
    // Mettre à jour le pathname précédent
    setPreviousPathname(pathname);
  }, [pathname, previousPathname]);

  // Ne pas afficher le loader au chargement initial (géré par SiteProtection)
  if (previousPathname === null || !isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <InitialLoader />
    </div>
  );
}

/**
 * Fonction utilitaire pour indiquer qu'une page est prête
 * À appeler dans les pages quand elles ont fini de charger leurs données
 */
export function markPageAsReady() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PAGE_READY_EVENT));
  }
}
