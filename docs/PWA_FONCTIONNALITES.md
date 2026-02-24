# PWA TEKH+ — Fonctionnalités à travailler

## Priorités

### 1. **Rafraîchissement (404)** — Corrigé
- **Problème** : En PWA, rafraîchir sur une route (/deals, /simulateur…) affichait "404 Not found".
- **Solution** : Service worker `sw-fallback.js` qui sert `index.html` pour toute navigation (fallback SPA). Enregistré en production dans `main.tsx`. Ne plus désenregistrer le SW dans `index.html`.

### 2. **Détection de modèle** — À renforcer
- **Problème** : La détection du modèle d’appareil (marque/modèle) ne fonctionne toujours pas de façon fiable.
- **Pistes** :
  - Vérifier le User-Agent réel sur les appareils cibles (ex. Samsung SM-A136B) et ajuster les regex / le parsing.
  - S’assurer qu’aucun fallback ne force "Apple" (déjà corrigé côté `deviceFinder`).
  - Envisager un écran "Nous n’avons pas reconnu votre modèle" avec champs manuels pré-remplis si possible.
  - Tester sur device réel et avec les logs DEV (`[TEKH detect]`).

### 3. **Installation & découverte**
- Afficher la bannière d’installation PWA (déjà en place via `PWAInstallBanner`).
- Vérifier que le manifest (`manifest.webmanifest`) a un `start_url` et un `scope` cohérents.
- Icônes 192x192 et 512x512 présentes et utilisées.

### 4. **Hors-ligne (offline)**
- Stratégie de cache pour les assets critiques (JS, CSS, index).
- Page ou message "Vous êtes hors ligne" quand le réseau est indisponible.
- Optionnel : cache des pages principales (accueil, simulateur) pour usage offline limité.

### 5. **Notifications push** (optionnel)
- Demande de permission et enregistrement du device pour les notifications.
- Backend pour envoyer les notifications (ex. Supabase, Firebase).

### 6. **UX PWA**
- Splash screen cohérent avec le thème (déjà en place dans `index.html`).
- Barre d’état / theme-color selon les écrans.
- Pas de double icône Paramètres (accès via logo déjà en place).

### 7. **Performance & cache**
- Préchargement des routes critiques si besoin.
- Invalidation du cache à la mise à jour (version dans le nom du cache SW : `tekh-fallback-1`).

---

## Récap technique

| Fonctionnalité        | Statut      | Fichiers concernés                    |
|-----------------------|------------|---------------------------------------|
| Fallback SPA (no 404) | En place   | `public/sw-fallback.js`, `main.tsx`, `index.html` |
| Détection modèle      | À améliorer| `src/core/api/deviceFinder.ts`, `EstimatorPage.tsx` |
| Install banner        | En place   | `PWAInstallBanner.tsx`                |
| Manifest & icônes     | En place   | `public/manifest.webmanifest`         |
| Offline / cache       | Partiel    | SW fallback uniquement                |
| Notifications push    | Non fait   | —                                    |
