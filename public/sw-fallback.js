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

// ——— Notifications Push (TEKH+) ———
self.addEventListener('push', function (e) {
  var data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (_) {}
  var title = data.title || 'TEKH+';
  var opts = {
    body: data.body || 'Nouvelle annonce disponible',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    data: { url: data.url || '/deals', dealId: data.dealId || null },
    tag: data.tag || 'tekh-deal',
    renotify: true,
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/deals';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf(self.location.origin) === 0 && 'focus' in clientList[i]) {
          clientList[i].navigate(url);
          return clientList[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
