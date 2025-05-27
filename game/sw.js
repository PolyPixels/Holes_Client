// sw.js

// Change this when you update your assets
const CACHE_NAME = 'holesgame-v1';

const PRECACHE_URLS = [
  '/',                            // HTML shell
  '/bundle.js',                   // your concatenated/minified JS
  '/assets/spritesheet.png',      // your big image
  '/assets/spritesheet.json',     // atlas manifest
  '/audio/dirtbag_shake.ogg'      // critical sound
];

// Install: pre-cache the core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch:  
//  • Return from cache for pre-cached assets  
//  • Otherwise try network, cache the response, and fallback to cache on failure
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always serve same-origin HTML from network (for updates)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/'))
    );
    return;
  }

  // Precache first
  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
    );
    return;
  }

  // Otherwise, network-first then cache-fallback
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        // Cache successful GET responses for later
        if (resp.ok && event.request.method === 'GET') {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
