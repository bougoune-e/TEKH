# À faire de ton côté – TEKH+

Ce document liste **tout ce que tu dois faire toi-même** (config, clés, déploiement) pour que les fonctionnalités ajoutées fonctionnent en local et en production.

---

## 1. Google Vision API (analyse des photos d’écran)

### 1.1 Google Cloud

1. Va sur [Google Cloud Console](https://console.cloud.google.com/).
2. Crée un projet (ou utilise un existant).
3. Active l’API **Cloud Vision API** :  
   Menu **APIs & Services** → **Enable APIs and Services** → cherche « Cloud Vision API » → **Enable**.
4. Crée une clé de compte de service :  
   **APIs & Services** → **Credentials** → **Create credentials** → **Service account** → donne un nom → **Create and continue** → (rôle optionnel) → **Done**.  
   Puis clique sur le compte créé → onglet **Keys** → **Add key** → **Create new key** → **JSON** → télécharge le fichier.

### 1.2 En local

1. Place le fichier JSON téléchargé **dans le dossier `google-vision-api/`** à la racine de TEKH. Tu peux :
   - le renommer en **`service-account-key.json`**, ou
   - le laisser avec le nom fourni par GCP (ex. `emerald-griffin-488621-u4-2042ca3edfe7.json`) : le code le détecte automatiquement.  
   Si ta clé est déjà dans un autre dossier (ex. `Images/google vision api/`), copie-la dans **`TEKH/google-vision-api/`**.
2. Installe les dépendances du module Vision (obligatoire pour que le backend charge l’analyse) :
   ```bash
   cd google-vision-api
   npm install
   cd ..
   ```
3. Pour tester uniquement le script de référence :
   ```bash
   cd google-vision-api
   node index.js
   ```
   (Le script utilise une URL d’image par défaut ; tu peux modifier `index.js` pour tester avec une autre image.)

### 1.3 Variables d’environnement pour le backend

Le backend (ex. Railway) doit avoir **une** des deux options suivantes :

- **Option A – Fichier**  
  Variable : **`GOOGLE_APPLICATION_CREDENTIALS`**  
  Valeur : chemin absolu vers le fichier JSON (ex. `/app/google-vision-api/service-account-key.json`).  
  Sur Railway, il faut que ce fichier soit présent au déploiement (ex. commité dans le repo sans être dans `.gitignore`, ou généré au build). **Ne pas commiter la clé en clair dans le repo si celui-ci est public.**

- **Option B – JSON en variable (recommandé en cloud)**  
  Variable : **`GOOGLE_VISION_KEY_JSON`**  
  Valeur : **tout le contenu** du fichier JSON de la clé, collé en une seule ligne (string).  
  Exemple : `{"type":"service_account","project_id":"ton-projet",...}`  
  Ainsi pas besoin de fichier sur le serveur.

### 1.4 Déploiement (ex. Railway)

- Si tu déploies le backend (tekh_backend) sur Railway :
  - Le dossier **`google-vision-api/`** doit être à la racine du repo (à côté de `tekh_backend/`), ce qui est déjà le cas.
  - Au build, exécuter **`npm install`** dans **`google-vision-api/`** pour que l’import `analyzeScreen.js` trouve `@google-cloud/vision`.  
    Exemple dans ton script de build ou dans Railway :  
    `cd google-vision-api && npm install && cd ..`
  - Configurer **`GOOGLE_VISION_KEY_JSON`** (ou **`GOOGLE_APPLICATION_CREDENTIALS`**) dans les variables d’environnement du service.

Sans ces étapes, le bouton « Analyser l’état de l’écran » renverra une erreur du type « Service d’analyse non configuré ».

---

## 2. Notifications Push (PWA)

### 2.1 Clés VAPID (une seule fois)

En local, à la racine du projet :

```bash
npx web-push generate-vapid-keys
```

Tu obtiens deux clés :

- **Clé publique**  
  À mettre côté **frontend** dans ton fichier **`.env`** (à la racine de TEKH) :  
  `VITE_VAPID_PUBLIC_KEY=ta_cle_publique_ici`  
  (sans espaces, une seule ligne).

- **Clé privée**  
  Ne **jamais** l’exposer côté client. Elle sert uniquement :
  - dans une **Supabase Edge Function** qui envoie les push, ou
  - dans ton **backend Node** (ex. Railway) quand tu enverras les notifications au moment où un deal est publié.

### 2.2 Côté frontend (déjà en place)

- Les utilisateurs peuvent activer les notifications dans **Paramètres** (section Notifications).
- La table **`push_subscriptions`** dans Supabase enregistre les abonnements (migration déjà présente).

### 2.3 Ce qu’il te reste à faire pour l’envoi des notifications

Quand l’admin **publie** un deal (statut `published`), il faut **envoyer une notification** à tous les abonnés de `push_subscriptions`. Deux possibilités :

- **Option A – Supabase Edge Function**  
  Créer une Edge Function déclenchée par un **Database Webhook** sur la table **`annonces`** (événement UPDATE, condition `NEW.status = 'published'`). Dans la fonction : récupérer les lignes de `push_subscriptions` (avec la clé **service role**), puis pour chaque abonnement envoyer une push avec une lib Web Push compatible Deno et la **clé privée VAPID**.  
  Détails : voir **`docs/PWA-WEB-PUSH-TEKH.md`**.

- **Option B – Backend Node (ex. Railway)**  
  Après la publication d’un deal (depuis ton API admin ou après un appel qui met à jour `annonces`), une route de ton backend récupère les abonnements dans `push_subscriptions` (via Supabase avec la **service role key**), puis utilise la lib **`web-push`** (npm) avec la **clé privée VAPID** pour envoyer la notification à chaque abonnement.

Jusqu’à ce que l’une de ces options soit en place, les utilisateurs pourront **s’abonner** aux notifications, mais **aucune notification ne sera envoyée** à la publication d’un deal.

---

## 3. Variables d’environnement – Récapitulatif

### 3.1 Frontend (Vite) – fichier `.env` à la racine de TEKH

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | Oui (si Supabase utilisé) | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Oui (si Supabase utilisé) | Clé anon Supabase |
| `VITE_VAPID_PUBLIC_KEY` | Pour les notifications push | Clé publique VAPID (générée par `npx web-push generate-vapid-keys`) |
| `VITE_API_URL` | Recommandé en prod | URL du backend (ex. `https://ton-backend.railway.app`) pour les appels API (produits, analyse Vision, etc.) |
| `VITE_ADMIN_EMAILS` | Optionnel | Liste d’emails admin séparés par des virgules (ex. `admin@example.com,autre@example.com`). **`tekhswap@gmail.com`** est déjà considéré comme admin dans le code. |

### 3.2 Backend (ex. tekh_backend sur Railway)

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `GOOGLE_APPLICATION_CREDENTIALS` ou `GOOGLE_VISION_KEY_JSON` | Pour l’analyse d’images | Voir section 1.3 |
| Variables Supabase (si le backend utilise Supabase) | Selon ton setup | URL + **service role key** si le backend doit lire `push_subscriptions` ou modifier des données protégées par RLS |
| `CORS_ORIGIN` | Optionnel | Origines autorisées, séparées par des virgules (ex. `https://ton-front.vercel.app,https://tekh.xyz`) |

### 3.3 Supabase (Dashboard)

- **Auth → URL Configuration** : ajouter les URLs de redirection après login (ex. `https://ton-site.com`, `https://ton-site.com/admin`, `http://localhost:5173`).
- **Auth → Redirect URLs** : mêmes URLs si tu utilises OAuth (Google, etc.).

---

## 4. Déploiement (Render / Railway / autre)

### 4.1 Frontend (ex. Render)

- Build : `npm run build` (à la racine de TEKH).
- Dossier de sortie : **`dist`**.
- Variables d’environnement : définir au moins `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, et en prod `VITE_API_URL` (URL du backend). Pour les push : `VITE_VAPID_PUBLIC_KEY`.

### 4.2 Backend (ex. Railway)

- Racine du service : généralement la racine du repo (où se trouvent `tekh_backend/` et `google-vision-api/`).
- Build : s’assurer que les dépendances du backend **et** de `google-vision-api` sont installées, par exemple :
  - `cd tekh_backend/backend && npm install`
  - `cd ../../google-vision-api && npm install`
  (ou un script unique qui fait les deux.)
- Démarrer : depuis `tekh_backend/backend`, par ex. `node server.js` (selon ta config).
- Variables d’environnement : au minimum **`GOOGLE_VISION_KEY_JSON`** (ou `GOOGLE_APPLICATION_CREDENTIALS`) pour l’analyse d’images.

---

## 5. Checklist rapide

- [ ] **Vision API**  
  - [ ] Projet Google Cloud créé, Cloud Vision API activée  
  - [ ] Clé de compte de service (JSON) créée et téléchargée  
  - [ ] En local : fichier dans `google-vision-api/service-account-key.json` (ou variable `GOOGLE_APPLICATION_CREDENTIALS`)  
  - [ ] En local : `cd google-vision-api && npm install`  
  - [ ] En prod : variable `GOOGLE_VISION_KEY_JSON` (ou `GOOGLE_APPLICATION_CREDENTIALS`) sur le backend  
  - [ ] En prod : build qui fait `npm install` dans `google-vision-api`

- [ ] **Notifications Push**  
  - [ ] `npx web-push generate-vapid-keys` exécuté  
  - [ ] `VITE_VAPID_PUBLIC_KEY` dans `.env` du frontend  
  - [ ] Clé privée VAPID stockée de façon sécurisée (backend ou Supabase secrets)  
  - [ ] Implémentation de l’envoi des push (Edge Function + webhook sur `annonces`, ou route backend après publication)

- [ ] **Environnement**  
  - [ ] `.env` frontend : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (prod), optionnellement `VITE_VAPID_PUBLIC_KEY` et `VITE_ADMIN_EMAILS`  
  - [ ] Backend : variables Vision + CORS + Supabase si besoin  
  - [ ] Supabase : Redirect URLs configurées

- [ ] **Déploiement**  
  - [ ] Frontend : build + variables d’env  
  - [ ] Backend : build incluant `google-vision-api` + variables d’env  

Quand ces points sont faits, l’analyse d’écran (Vision) et l’abonnement aux notifications seront opérationnels ; l’envoi effectif des notifications le sera dès que l’envoi push (Edge Function ou backend) sera en place.
