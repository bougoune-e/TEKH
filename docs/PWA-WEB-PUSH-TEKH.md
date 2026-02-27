# Notifications Push PWA – TEKH+

## Choix : Web Push API + Supabase (100 % autonome)

- **Pas d’API tierce** (Firebase/OneSignal) : tout repose sur Supabase + ton backend.
- **Déclenchement** : quand l’admin publie un deal (statut `published`), envoi d’une notification aux abonnés.
- **Stack** : Web Push API, Service Worker (déjà présent), table Supabase `push_subscriptions`, backend ou Edge Function pour envoyer les push avec VAPID.

---

## 0. Tu ne passes pas par une table « admin »

- **Aucune table admin dédiée** : l’envoi des notifications se déclenche sur la **table `annonces`** (celle que l’admin utilise déjà).
- **Scénario** : l’admin clique sur « Publier » dans l’interface Admin (Deals) → ton app met à jour la ligne dans `annonces` avec `status = 'published'` (via `updateDeal(id, { status: 'published' })`).
- **Déclencheur** : dès qu’une ligne de `annonces` passe à `status = 'published'` (UPDATE), un **webhook** ou ton backend envoie les push à tous les abonnés de `push_subscriptions`.
- En résumé : **c’est la table `annonces` qui pilote l’envoi**, pas une table séparée. Tu configures un webhook sur `annonces` (voir section 5) ou une route backend appelée après publication.

---

## 1. Génération des clés VAPID (une seule fois)

En local :

```bash
npx web-push generate-vapid-keys
```

Tu obtiens une paire **public** et **private**.  
- **Public** : exposée côté client (ex. `VITE_VAPID_PUBLIC_KEY` dans `.env`).  
- **Private** : uniquement côté serveur (backend ou Supabase Edge Function), jamais exposée.

---

## 2. Table Supabase `push_subscriptions`

Une migration crée la table qui stocke les abonnements push (endpoint, clés p256dh/auth, optionnellement `user_id`).  
Le client envoie l’objet `PushSubscription` (JSON) à ton API qui l’enregistre en base.  
Lors de l’envoi des notifications, le backend récupère toutes les lignes (ou par `user_id`) et appelle l’API Web Push avec la clé privée VAPID.

---

## 3. Service Worker (`public/sw-fallback.js`)

- **`push`** : à la réception d’un push, afficher une notification avec `event.waitUntil(self.registration.showNotification(...))`.
- **`notificationclick`** : ouvrir l’URL du deal (ou `/deals`) avec `clients.openWindow(url)`.

Le payload du push contient au minimum titre, corps et `url` (ou `dealId`).

---

## 4. Côté client (PWA)

1. **Demander la permission** : `Notification.requestPermission()`.
2. **Abonner** : `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })`.
3. **Enregistrer** : envoyer `subscription.toJSON()` à ton backend qui l’insère dans `push_subscriptions` (et optionnellement lie à `auth.uid()`).

Tu peux placer cette logique dans un bouton « Activer les notifications » (Settings ou bannière) et ne pas demander la permission au premier chargement.

---

## 5. Envoi des notifications (quand l’admin publie un deal)

Deux options :

### A) Backend Node (ex. Railway)

- À la publication d’un deal (API admin ou webhook), récupérer toutes les lignes de `push_subscriptions`.
- Pour chaque subscription, appeler `web-push.sendNotification(subscription, payload, { vapidDetails: { privateKey, publicKey } })`.
- Payload : `JSON.stringify({ title: '...', body: '...', url: '/deal/' + dealId })`.

### B) Supabase Edge Function

- Déclenchée par un webhook sur la table `annonces` (INSERT/UPDATE où `status = 'published'`).
- Dans la fonction : lire `push_subscriptions`, utiliser une librairie Web Push (compatible Deno) et la clé privée VAPID pour envoyer les notifications.

---

## 6. Résumé des fichiers impliqués

| Élément | Fichier / lieu |
|--------|-----------------|
| Clés VAPID | Générées une fois, public en `.env`, private côté serveur |
| Table abonnements | `supabase/migrations/..._push_subscriptions.sql` |
| Gestion push + clic | `public/sw-fallback.js` (push + notificationclick) |
| Permission + abonnement + enregistrement | `src/.../notifications/pushNotifications.ts` + UI (Settings ou bannière) |
| Envoi au publish | Backend (Node) ou Supabase Edge Function |

---

## 7. Bonnes pratiques TEKH+

- Ne pas demander la permission au premier chargement ; proposer « Activer les notifications » dans Paramètres ou via une bannière discrète.
- Notifier uniquement pour les **nouveaux deals publiés** (et éventuellement « À l’affiche cette semaine » si tu ajoutes ce flux).
- En cas d’erreur 410/404 sur un endpoint, supprimer la ligne correspondante de `push_subscriptions` pour garder la base propre.
