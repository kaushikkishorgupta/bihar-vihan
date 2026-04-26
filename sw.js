const CACHE_NAME = 'bv-static-v4';
const URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './media-gallery.html',
  './contact-us.html',
  './privacy-policy.html',
  './terms-and-conditions.html',
  './disclaimer.html',
  './manifest.webmanifest',
  './LOGO.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const req = event.request;
  const accept = req.headers.get('accept') || '';
  const isHtml = req.mode === 'navigate' || accept.includes('text/html');
  const isCoreAsset = /\/(script\.js|style\.css|index\.html|admin\.html|blog\.html|media-gallery\.html)$/.test(req.url);

  // Network-first for HTML/core assets so latest UI/JS fixes are not stuck in old cache.
  if (isHtml || isCoreAsset) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for media/static files.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
