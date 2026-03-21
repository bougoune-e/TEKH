# PRT (Prix de Référence TEKH+) — eBay & base `smartphones`

## 1. Appliquer la migration Supabase

Dans le dashboard Supabase → **SQL** ou via CLI :

- Fichier : `supabase/migrations/20250321120000_smartphones_tekh_points.sql`

Crée les tables `smartphones` et `tekh_point_credits` + RLS.

## 2. Variables d’environnement

1. Copier `.env.example` vers `.env` à la racine du repo (et/ou `tekh_backend/backend/.env` pour le backend).
2. Renseigner :
   - **`EBAY_CLIENT_ID`** / **`EBAY_CLIENT_SECRET`** — clés **Production** (l’app eBay doit être en Production pour des prix réalistes).
   - **`SUPABASE_URL`** + **`SUPABASE_SERVICE_ROLE_KEY`** — pour les scripts qui écrivent en base (ne jamais exposer la clé service au frontend).

Optionnel :

- `EBAY_MARKETPLACE_ID` — défaut `EBAY_FR` (annonces en EUR).
- `EBAY_FALLBACK_MARKETPLACES` — marchés de secours si le premier ne renvoie aucune annonce USED, ex. `EBAY_DE,EBAY_GB` (défaut dans le code).
- `EBAY_DEBUG=1` — logs (marché, filtre, `total` renvoyé par l’API).
- `PRT_SYNC_DELAY_MS` — pause entre appels eBay (défaut 500 ms).
- `PRT_MAX_AGE_DAYS` — rafraîchir les PRT plus vieux que N jours (défaut 30).
- `PRT_SYNC_LIMIT` — nombre max de lignes traitées par exécution (défaut 200).

### Dépannage : `medianEur` / `prtFcfa` à `null`, `sampleSize: 0`

- Le code utilise le filtre officiel **`conditions:{USED}`** (et non un seul `conditionIds` trop strict).
- Sur **`EBAY_FR`**, certaines requêtes n’ont **aucune** annonce : le module retente avec **`EBAY_DE`** puis **`EBAY_GB`**.
- Vérifier dans [eBay Developers](https://developer.ebay.com/) que l’application a bien accès aux **Buy APIs** (Browse).
- Tester : `EBAY_DEBUG=1 npm run prt:test-ebay` puis une autre requête :  
  `npm run prt:test-ebay -- "iPhone 13 128"`

## 3. Chaîne npm (racine TEKH)

| Script | Rôle |
|--------|------|
| `npm run prt:generate-seed` | Régénère `seeds/smartphones.json` (50 lignes). |
| `npm run prt:seed` | Upsert du seed dans `public.smartphones` (clé service). |
| `npm run prt:test-ebay` | Test OAuth + médiane sans DB (`Samsung Galaxy A54 128GB` par défaut). |
| `npm run prt:sync-prices` | Met à jour `prt_fcfa` / `prix_ebay_eur` / `prt_updated_at` via Browse API. |
| `npm run prt:assign-classes` | Recalcule `classe_tekh` (A–F) à partir du PRT et des specs. |

Ordre conseillé une première fois : migration → `prt:seed` → `prt:sync-prices` → `prt:assign-classes`.

## 4. Intégration app (simulateur & profil)

- **`getModelInfo` / `getAvailableVariants`** (`src/core/api/supabaseApi.ts`) utilisent en priorité la table **`smartphones`** (PRT = `prt_fcfa`), puis l’ancien référentiel `variants` / API produits.
- **`src/core/api/smartphonesCatalog.ts`** : correspondance marque / modèle / stockage (ex. variante `128GB`).
- **Profil** : carte **TekhPoints** (solde + prochaine expiration) via `fetchTekhPointsSummary` et la table `tekh_point_credits`.
- **Simulateur** : mention du PRT « catalogue » ou « index &gt; 30 j. » selon `prt_updated_at` (`isPrtFresh` dans `prtResolve.ts`).

## 5. Formule PRT (code)

Implémentée dans `tekh_backend/backend/lib/ebay.mjs` :

- Médiane des prix **USED** (filtre `conditions:{USED}`, replis marché / `conditionIds` si besoin) sur les résultats Browse.
- **PRT_FCFA** = médiane_EUR × `facteur_afrique` (défaut **0,90** par ligne) × **655,957** (EUR → FCFA).

> L’API **Browse** renvoie des annonces en cours, pas des ventes conclues. Pour une médiane type « sold », il faudra une autre source ou un post-traitement métier.

## 6. Cron (exemple)

- **Prix** : mensuel — `prt:sync-prices` puis `prt:assign-classes`.
- **Seed / catalogue** : ponctuel ou après `prt:generate-seed`.

Sur un hôte avec Node 20+ et les variables chargées (fichier `.env` ou secrets CI).

## 7. TekhPoints

La table `tekh_point_credits` est prête pour les crédits (émission, expiration). La règle métier (30 % max par transaction, 6 mois) reste à appliquer dans l’app / Edge Functions.
