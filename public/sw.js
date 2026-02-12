// Version du cache - À METTRE À JOUR MANUELLEMENT lors des déploiements importants
// ⚡ PERFORMANCE: Version fixe pour éviter d'invalider le cache à chaque visite
// Incrémenter ce numéro uniquement quand les assets statiques changent
const CACHE_VERSION = 'v1.3.0';
const CACHE_NAME = 'synapso-' + CACHE_VERSION;
const OFFLINE_PAGE = '/offline.html';
const urlsToCache = [
  '/',
  '/offline.html',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
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

// Stratégie de cache : Network First avec fallback Cache
// 🔒 SÉCURITÉ: Ne pas cacher les routes API (données sensibles)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;
  
  // Exclure les routes API du cache (données sensibles)
  // et les chunks Next.js (content-hashés, gérés par le framework — les cacher en
  // cache-first cause des ChunkLoadError après déploiement car les anciens chunks
  // référencent d'autres chunks qui ne sont plus ni en cache ni sur le serveur)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Retourner une réponse d'erreur pour les API en mode offline
        return new Response(
          JSON.stringify({ error: 'Vous êtes hors ligne. Veuillez vérifier votre connexion.' }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }
  
  // Pour les pages HTML : Network First avec fallback sur cache, puis page offline
  if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la réponse est valide, la mettre en cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Essayer le cache d'abord
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si pas de cache, retourner la page offline
            return caches.match(OFFLINE_PAGE);
          });
        })
    );
    return;
  }
  
  // Pour les assets statiques (images, fonts, etc.) : Cache First avec fallback Network
  if (request.destination === 'image' || 
      request.destination === 'font' || 
      request.destination === 'style' ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|css|js)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Vérifier si la réponse est valide avant de la mettre en cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            
            return response;
          });
      })
    );
    return;
  }
  
  // Stratégie par défaut : Network First avec fallback Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cloner la réponse pour la mettre en cache
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, essayer le cache
        return caches.match(request);
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

