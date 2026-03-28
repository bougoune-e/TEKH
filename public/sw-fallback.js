/* TEKH+ PWA: évite 404 au rafraîchissement sur les routes SPA */
const CACHE = 'tekh-fallback-3'; // bumped 2026-03-28
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

// ——— Notifications Push TEKH+ (style riche) ———
self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (_) {}

  var title = data.title || 'TEKH+';

  var opts = {
    body: data.body || 'Nouvelle offre disponible',

    // Logo TEKH+ affiché dans la bannière (grand carré à droite sur Android/Chrome)
    icon: '/icon-512.jpeg',

    // Petite icône monochrome dans la barre de statut Android
    badge: '/icon.jpeg',

    // Image de prévisualisation large (comme Pinterest) — optionnelle
    image: data.image || undefined,

    // Données pour le click handler
    data: {
      url: data.url || '/deals',
      dealId: data.dealId || null,
    },

    // Évite les doublons si même tag
    tag: data.tag || 'tekh-notif',
    renotify: true,

    // Reste visible jusqu'à interaction utilisateur (comme Pinterest)
    requireInteraction: true,

    // Vibration: court-court-long (pattern distinctif)
    vibrate: [100, 50, 100, 50, 300],

    // Horodatage affiché dans la notif
    timestamp: Date.now(),

    // Boutons d'action sous la notification
    actions: [
      {
        action: 'open',
        title: '👀 Voir',
      },
      {
        action: 'dismiss',
        title: '✕ Ignorer',
      },
    ],
  };

  // Supprimer image si non fournie (évite undefined dans l'objet)
  if (!opts.image) delete opts.image;

  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();

  // Bouton "Ignorer" → ne fait rien
  if (e.action === 'dismiss') return;

  // Bouton "Voir" ou clic sur le corps → ouvre l'URL
  var url = (e.notification.data && e.notification.data.url) ? e.notification.data.url : '/deals';

  // Transformer les chemins relatifs en URL absolue
  if (url.startsWith('/')) {
    url = self.location.origin + url;
  }

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Chercher un onglet TEKH+ déjà ouvert et le focus
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Sinon ouvrir un nouvel onglet
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
