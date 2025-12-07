'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js', {
            updateViaCache: 'none' // Toujours vérifier les mises à jour depuis le serveur
          })
          .then((registration) => {
            console.log('Service Worker enregistré avec succès:', registration.scope);

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
                    // Nouveau service worker installé, recharger la page
                    console.log('Nouvelle version disponible, rechargement...');
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('Erreur lors de l\'enregistrement du Service Worker:', error);
          });
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
          console.log('Service Worker mis à jour, rechargement...');
          // Recharger automatiquement la page
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

