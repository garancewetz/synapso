'use client';

import { useEffect } from 'react';

export function PWARegister() {
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

            // Écouter les mises à jour du service worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    window.location.reload();
                  }
                });
              }
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

      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          window.location.reload();
        }
      });

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
  }, []);

  return null;
}

