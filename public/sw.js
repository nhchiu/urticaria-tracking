/* UAS7 Diary 蕁麻疹日記 — offline service worker.
 *
 * App-shell + runtime caching for the `expo export --platform web` output:
 * - On install, precache the app shell (page, manifest, icons).
 * - Navigations: network-first, fall back to the cached app shell offline.
 * - Same-origin static assets (JS bundles, fonts, images): cache-first with
 *   runtime caching, so the app keeps working offline after the first visit.
 *
 * Bump CACHE_VERSION to force clients onto a fresh cache on the next deploy.
 */

const CACHE_VERSION = 'uas7-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' })))
      )
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Never fail installation because of a single bad asset.
        console.error('[sw] precache failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App navigation: try the network, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || fetch(request)))
    );
    return;
  }

  // Static assets: cache-first, populate the cache on network success.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Only cache successful, basic (same-origin, no-cors-safe) responses.
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
