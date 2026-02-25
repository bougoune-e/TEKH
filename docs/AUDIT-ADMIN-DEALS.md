# Audit et proposition – Version Admin TEKH+

## 1. Structure actuelle des deals

### 1.1 Modèle de données (front)

- **Type** : `DealPost` (`src/shared/data/dealsData.ts`)
  - `id`, `title`, `brand`, `model`, `condition`, `description`, `price`, `images[]`, `storage`, `ram`, `color`, `estimatedValue`, `verified`, `negotiable`, `tags[]`, `createdAt`, `location`, `ownerId`, `sellerName`, `contactPhone`, `contactWhatsapp`, `contactEmail`

### 1.2 Backend / Supabase

- **Table** : `annonces`
  - Lecture : `fetchDeals()` → `select("*").order("created_at", { ascending: false })`
  - Écriture : `insertDeal(deal)`, `deleteDealById(id)`
  - Mapping : `created_at` ↔ `createdAt`, `owner_id` ↔ `ownerId`, `seller_name` ↔ `sellerName`, etc.
- **Pas de champ `status`** aujourd’hui : toutes les lignes sont considérées “visibles”.
- **Images** : côté front `DealPost.images: string[]` ; côté API, `insertDeal` envoie le deal tel quel (les URLs/images sont dans l’objet). Stockage possible Supabase Storage + URLs en base.

### 1.3 Où les deals sont consommés

| Endpoint / Contexte | Fichier | Usage |
|--------------------|---------|--------|
| Liste deals | `Deals.tsx` | `fetchDeals()` au mount → `setDealsList(rows)` dans `DealsProvider` |
| Contexte global | `deals.context.tsx` | `deals`, `setDealsList`, `addDeal`, `removeDeal` |
| Détail | `DealDetails.tsx` | `useDeals().deals` + `find(d => d.id === id)` |
| Recherche | `SearchPage.tsx` | Filtre sur `useDeals().deals` |
| Mes annonces | `MyPosts.tsx` | `deals.filter(d => d.ownerId === userId)` |
| Publication | `PublishPage.tsx` | `addDeal` + `insertDeal()` Supabase (si configuré) |
| Cartes | `PhoneCard.tsx` | Reçoit `id`, `brand`, `model`, `price`, `image`, etc. |

### 1.4 Affichage (cartes)

- **PhoneCard** : `id`, `brand`, `model`, `condition`, `price`, `originalPrice`, `image` (1ère image), `tag`, `badges`, `location`.
- Les deals sans image utilisent une icône Smartphone (fallback).

### 1.5 Bannières / Home

- **DealsSection** (home) : données en dur dans `DealsSection.tsx` (tableau local), pas encore branché sur l’API.
- Pas de table `banners` ni de gestion bannières côté API actuellement.

### 1.6 Notifications

- Page **Notifications** : statique (“Aucune notification”).
- Pas d’API ni de table `notifications` pour l’instant.

---

## 2. Proposition d’architecture Admin alignée avec l’existant

### 2.1 Principes

- Réutiliser **le même type `DealPost`** (ou un type étendu avec `status`, `published_at`, etc.) pour que l’app publique n’ait qu’à filtrer.
- **Une seule source de vérité** : table `annonces` (ou équivalent) avec un champ `status`.
- L’app publique ne charge que les deals avec `status = 'published'`.
- L’Admin fait tout le CRUD sur les deals et gère bannières / notifications plus tard.

### 2.2 Base de données (évolutions minimales)

- **Table `annonces`** (existante) :
  - Ajouter (si absent) : `status` (`draft` | `published` | `archived`), `published_at` (timestamp nullable), éventuellement `stock_quantity`, `scheduled_publish_at`.
  - Garder le mapping actuel (camelCase ↔ snake_case) pour ne pas casser `fetchDeals` / `insertDeal`.
- **Tables à prévoir** (hors scope “deals seuls”) :
  - `banners` : id, image_url, link_type, link_id, position, active, created_at.
  - `notifications` : id, title, message, target, scheduled_at, sent, created_at.

### 2.3 Backend (API)

- **Sécurité** : routes `/admin/*` ou `api/admin/*` réservées aux utilisateurs avec rôle `ADMIN` (vérification token + champ `role` en base ou dans le JWT).
- **Deals** :
  - `GET /api/deals` (ou garder `fetchDeals` Supabase) : côté client, filtrer `WHERE status = 'published'` pour l’app publique.
  - Admin : `GET /api/admin/deals` → tous les deals (tous statuts).
  - Admin : `POST /api/admin/deals`, `PATCH /api/admin/deals/:id`, `DELETE /api/admin/deals/:id`.
  - Champs importants : mêmes que `DealPost` + `status`, `published_at`, `stock_quantity`, etc.
- **Images** : garder le flux actuel (upload Supabase Storage, URLs dans `images[]`) ; l’Admin réutilise le même mécanisme que `PublishPage` (upload + sauvegarde des URLs).

### 2.4 Frontend Admin – Nouvelles routes (sous le layout existant)

- Réutiliser **AdminLayout** et la structure actuelle (`/admin`, `/admin/deals`, etc.) si elle existe.
- Routes proposées :
  - `/admin` ou `/admin/dashboard` : tableau de bord (nb deals par statut, nb vues si dispo plus tard).
  - `/admin/deals` : liste des deals (tous statuts) avec filtres par statut, recherche, pagination.
  - `/admin/deals/new` : création deal (formulaire type PublishPage : marque, modèle, état, prix, images, stock, etc.).
  - `/admin/deals/:id/edit` : édition du même formulaire.
  - `/admin/banners` : gestion bannières (à implémenter après validation).
  - `/admin/notifications` : gestion notifications (idem).

### 2.5 Composants à (ré)utiliser ou adapter

- **Formulaires** : s’inspirer de `PublishPage.tsx` (brand, model, storage, ram, condition, price, description, images, contact…) pour créer un formulaire Admin “Deal” (création / édition).
- **Upload images** : même logique que `PublishPage` + `uploadImage` (ou équivalent) pour garder le même format `images: string[]`.
- **Liste** : tableau ou grille de cartes avec colonnes : titre, marque, modèle, prix, statut, date, actions (éditer, publier, archiver, supprimer).
- **PhoneCard** ou variante “compact” pour prévisualisation dans l’Admin.

### 2.6 Logique de publication

- **Création** : deal créé en `status = 'draft'` par défaut.
- **Publication** : action “Publier” → `status = 'published'`, `published_at = now()`.
- **Archivage** : “Archiver” → `status = 'archived'`.
- **App publique** : `fetchDeals()` doit devenir (côté backend ou côté client) :  
  `select("*").eq("status", "published").order("created_at", { ascending: false })`  
  (et éventuellement ne plus mélanger avec les données mock si plus utilisées.)

### 2.7 Bannières et notifications

- À traiter dans une phase 2 : définir schéma exact (banners, notifications), endpoints Admin, puis intégration Home (bannières) et page Notifications (liste + envoi).

---

## 3. Plan d’implémentation recommandé (après validation)

1. **Migration BDD** : ajout des champs `status`, `published_at` (et si besoin `stock_quantity`, `scheduled_publish_at`) sur `annonces`.
2. **Backend** :  
   - Adapter `fetchDeals()` pour l’app publique (filtrer `status = 'published'`).  
   - Créer les endpoints Admin (CRUD deals) avec vérification rôle ADMIN.
3. **Frontend Admin** :  
   - Dashboard minimal (compteurs).  
   - Page liste deals avec filtres et actions.  
   - Page création / édition deal (formulaire + upload images comme PublishPage).  
   - Brancher les appels aux nouveaux endpoints.
4. **Sécurité** : middleware ou guard sur toutes les routes `/admin/*` (vérifier rôle ADMIN).
5. **Phase 2** : bannières, notifications, statistiques (vues/clics) si requis.

---

## 4. Résumé

- **Deals** : déjà structurés en `DealPost`, alimentés par `annonces` et `deals.context`. Il suffit d’ajouter `status` (et champs associés), de filtrer en lecture pour l’app publique, et d’exposer un CRUD Admin sécurisé.
- **Images** : réutiliser le flux actuel (Storage + URLs dans le deal).
- **Admin** : nouvelles routes sous `/admin`, formulaire deal aligné sur `PublishPage`, même modèles et même format d’images pour rester cohérent avec l’app publique.

Une fois cette structure validée, l’implémentation peut suivre les étapes ci‑dessus sans dupliquer la logique métier existante.

---

## 5. Implémentation réalisée (post-validation)

- **Migration** : `supabase/migrations/20250226000000_add_annonces_status.sql` (à exécuter dans Supabase → SQL Editor).
- **API** : `fetchDeals()` filtre `status = 'published'` (fallback si colonne absente). `fetchAllDealsForAdmin()`, `fetchDealById()`, `updateDeal()`, `insertDeal()` avec `status` et `published_at`.
- **Admin** : routes `/admin/deals` (liste), `/admin/deals/new`, `/admin/deals/:id/edit`. Dashboard avec compteurs (total, brouillons, publiés).
- **Sécurité** : `AdminRoute` vérifie `user_metadata.role === 'ADMIN'` ou email dans `VITE_ADMIN_EMAILS` (variable d’environnement, liste d’emails séparés par des virgules).
- **Configuration** : ajouter `VITE_ADMIN_EMAILS=ton@email.com` (ou plusieurs emails séparés par des virgules) pour accéder à `/admin`.
