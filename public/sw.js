const CACHE_NAME = 'tekh-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/logos/robot.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then((response) => {
      const resClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, resClone));
      return response;
    }).catch(() => cached))
  );
});
