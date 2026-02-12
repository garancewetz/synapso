'use client';

import { useEffect, useState, useCallback } from 'react';

export function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register('/sw.js', {
          updateViaCache: 'none'
        })
        .then((registration) => {
          console.log('Service Worker enregistré avec succès:', registration.scope);

          // Vérifier les mises à jour toutes les heures
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Quand un nouveau SW est détecté : afficher la bannière (pas de reload auto)
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nouvelle version disponible');
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    };

    // Enregistrer après le chargement complet de la page
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }

    // Message SW_UPDATED du SW : afficher la bannière (pas de reload auto)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('Service Worker mis à jour');
        setUpdateAvailable(true);
      }
    });

    // Vérifier les mises à jour au focus (pas immédiatement au mount)
    const checkForUpdates = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    };

    window.addEventListener('focus', checkForUpdates);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    });
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span>Nouvelle version disponible</span>
      <button
        onClick={handleReload}
        style={{
          backgroundColor: 'white',
          color: '#4F46E5',
          border: 'none',
          padding: '0.375rem 0.75rem',
          borderRadius: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
        }}
      >
        Actualiser
      </button>
    </div>
  );
}
