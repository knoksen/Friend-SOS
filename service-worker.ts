/// <reference lib="webworker" />
// FIX: Removed redundant declaration of 'self'. The 'webworker' lib reference already provides the type for the global 'self' object, so this line was causing a redeclaration error.

// Define a cache name
const CACHE_NAME = 'friend-sos-cache-v1';

// List of files to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // In a real build, this would be the bundled JS file.
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdn.tailwindcss.com'
  // NOTE: The dynamically imported modules from aistudiocdn.com will be cached at runtime during the first fetch.
];

// Install a service worker
self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests using a cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response. Allow basic and cors requests (for CDN).
            if (!response || response.status !== 200 || !['basic', 'cors'].includes(response.type)) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update a service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
