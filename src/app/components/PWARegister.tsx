'use client';

import { useEffect } from 'react';
import { useToast } from '@/app/contexts/ToastContext';

export function PWARegister() {
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Ne pas enregistrer le service worker en développement
      // Le SW cache les assets JS (Cache First) et empêche le HMR/rechargement correct
      if (process.env.NODE_ENV === 'development') {
        // Désenregistrer tout SW existant en dev pour éviter les problèmes de cache
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
        return;
      }
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js', {
            updateViaCache: 'none' // Toujours vérifier les mises à jour depuis le serveur
          })
          .then((registration) => {
            // Vérifier les mises à jour toutes les heures
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);

            // ⚡ COLD START : pas de reload automatique quand un nouveau SW
            // s'installe. skipWaiting + clients.claim côté SW lui permettent
            // de prendre le contrôle silencieusement.
            // ℹ️ On informe juste l'utilisateur : le nouveau SW supprime
            // l'ancien cache, donc un lazy-load d'un chunk périmé pourrait
            // 404. Le toast incite à recharger quand l'utilisateur est prêt.
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;
              newWorker.addEventListener('statechange', () => {
                const isUpdate = newWorker.state === 'installed' && navigator.serviceWorker.controller;
                if (isUpdate) {
                  showToast('Nouvelle version disponible. Rechargez la page pour l\'activer.');
                }
              });
            });
          })
          .catch(() => undefined);
      };

      // Enregistrer immédiatement
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
      }

      // Vérifier les mises à jour au focus de la fenêtre et à l'ouverture
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      };

      // Vérifier immédiatement
      checkForUpdates();

      // Vérifier au focus de la fenêtre
      window.addEventListener('focus', checkForUpdates);
      
      // Vérifier aussi quand la page devient visible (retour d'onglet)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          checkForUpdates();
        }
      });
    }
  }, [showToast]);

  return null;
}

