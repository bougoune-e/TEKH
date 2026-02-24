/* TEKH+ PWA: évite 404 au rafraîchissement sur les routes SPA */
const CACHE = 'tekh-fallback-1';
const FALLBACK = '/index.html';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(FALLBACK)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => (r && r.ok ? r : caches.match(FALLBACK).then((c) => c || r)))
      .catch(() => caches.match(FALLBACK).then((r) => r || caches.match('/')))
  );
});
