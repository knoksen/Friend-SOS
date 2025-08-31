/// <reference lib="webworker" />
/// <reference lib="webworker.iterable" />

declare const self: ServiceWorkerGlobalScope;
declare const clients: Clients;

type CacheStrategy = 'static' | 'dynamic' | 'api' | 'network-only';

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  data?: any;
  actions?: { action: string; title: string; }[];
  requireInteraction?: boolean;
  tag?: string;
}

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface PeriodicSyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

interface NotificationEvent extends ExtendableEvent {
  readonly action: string;
  readonly notification: Notification;
}

interface PushMessageData {
  json(): any;
}

// Cache names for different types of content
const CACHE_NAMES = {
  static: 'friend-sos-static-v1',
  dynamic: 'friend-sos-dynamic-v1',
  api: 'friend-sos-api-v1'
};

// Configure cache expiration
const EXPIRATION_TIME = {
  api: 60 * 60 * 1000, // 1 hour for API responses
  dynamic: 7 * 24 * 60 * 60 * 1000 // 1 week for dynamic content
};

// List of files to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/icons/sos-96.png',
  '/icons/checkin-96.png',
  'https://cdn.tailwindcss.com'
];

// API endpoints to cache with network-first strategy
const API_ROUTES = [
  '/api/contacts',
  '/api/settings',
  '/api/templates'
];

// Helper function to determine caching strategy based on request
function getCacheStrategy(request: Request): 'static' | 'dynamic' | 'api' | 'network-only' {
  const url = new URL(request.url);

  // Static resources
  if (STATIC_RESOURCES.some(resource => url.pathname.endsWith(resource))) {
    return 'static';
  }

  // API routes
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    return 'api';
  }

  // Emergency endpoints should never be cached
  if (url.pathname.includes('/sos') || url.pathname.includes('/emergency')) {
    return 'network-only';
  }

  // Default to dynamic caching
  return 'dynamic';
}

// Helper function to check if a cached response is expired
function isResponseExpired(response: Response, cacheType: 'api' | 'dynamic'): boolean {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;

  const cachedDate = new Date(dateHeader).getTime();
  const now = new Date().getTime();
  const age = now - cachedDate;

  return age > EXPIRATION_TIME[cacheType];
}

// Install service worker and cache static resources
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
  );
});

// Handle fetch events with different strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  const strategy = getCacheStrategy(event.request);

  switch (strategy) {
    case 'static':
      // Cache-first strategy for static resources
      event.respondWith(
        caches.match(event.request)
          .then(response => response || fetch(event.request))
      );
      break;

    case 'api':
      // Network-first strategy for API calls with fallback to cache
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const clone = response.clone();
            caches.open(CACHE_NAMES.api)
              .then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => 
            caches.match(event.request)
              .then(response => {
                if (!response || isResponseExpired(response, 'api')) {
                  return new Response(JSON.stringify({ error: 'Offline: No cached data available' }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
                return response;
              })
          )
      );
      break;

    case 'network-only':
      // Network-only strategy for emergency endpoints
      event.respondWith(fetch(event.request));
      break;

    case 'dynamic':
      // Stale-while-revalidate strategy for dynamic content
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            const fetchPromise = fetch(event.request)
              .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAMES.dynamic)
                  .then(cache => cache.put(event.request, clone));
                return response;
              });

            return cachedResponse || fetchPromise;
          })
      );
      break;
  }
});

// Clean up old caches on activation
self.addEventListener('activate', (event: ExtendableEvent) => {
  const validCacheNames = Object.values(CACHE_NAMES);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(name => !validCacheNames.includes(name))
            .map(name => caches.delete(name))
        )
      )
  );
});

// Handle background sync for offline messages
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'emergency-message') {
    event.waitUntil(
      // Get all queued emergency messages and try to send them
      fetch('/api/emergency/send-queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }
});

// Handle periodic sync for check-ins
self.addEventListener('periodicsync', (event: PeriodicSyncEvent) => {
  if (event.tag === 'check-in') {
    event.waitUntil(
      // Perform check-in tasks
      fetch('/api/check-in/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const options: ExtendedNotificationOptions = {
    body: data.message,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url },
    actions: [
      { action: 'respond', title: 'Respond' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: true,
    tag: 'friend-sos-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Friend SOS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'respond') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
});
