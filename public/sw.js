const CACHE_NAME = 'safescan-v2';
const PRECACHE_ASSETS = [
  '/',
  '/create',
  '/manifest.json',
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: routing strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Network-first for profile pages (/p/*)
  if (url.pathname.startsWith('/p/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets (CSS, fonts, images, JS chunks)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for navigation and API requests
  event.respondWith(networkFirst(request));
});

// Network-first strategy: try network, cache response, fall back to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Offline fallback for profile pages: return cached version if available
    if (request.url.includes('/p/')) {
      const fallback = await caches.match(request);
      if (fallback) return fallback;
    }
    return new Response('Offline — please check your connection.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    });
  }
}

// Cache-first strategy: serve from cache, fall back to network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', {
      status: 503,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    });
  }
}

// Check if a path is a static asset
function isStaticAsset(pathname) {
  return /\.(css|js|woff2?|ttf|eot|otf|png|jpg|jpeg|gif|svg|webp|ico|avif)$/i.test(pathname)
    || pathname.startsWith('/_next/static/');
}
