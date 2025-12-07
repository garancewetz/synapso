// Version du cache - mise à jour automatiquement à chaque déploiement
const CACHE_VERSION = 'v' + Date.now();
const CACHE_NAME = 'synapso-' + CACHE_VERSION;
const urlsToCache = [
  '/',
  '/icon.svg',
  '/logoBrain.png',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  // Forcer l'activation immédiate du nouveau service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  // Prendre le contrôle immédiatement de toutes les pages
  event.waitUntil(
    Promise.all([
      // Nettoyer tous les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle de toutes les pages ouvertes
      clients.claim()
    ])
  );
  
  // Notifier toutes les pages qu'une mise à jour est disponible
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATED',
          cacheVersion: CACHE_VERSION
        });
      });
    })
  );
});

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cloner la réponse
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, essayer le cache
        return caches.match(event.request);
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
  
  // Vérifier les mises à jour quand demandé
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    self.registration.update().then(() => {
      event.ports[0]?.postMessage({ type: 'UPDATE_CHECKED' });
    });
  }
});

// Gestion du clic sur une notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

