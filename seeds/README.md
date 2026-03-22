# Seeds TEKH+

- **`smartphones.json`** — liste de modèles (marque, modèle, variante, année, specs).  
  - Démo courte : `npm run prt:generate-seed`  
  - **Référence ~1520 smartphones** (depuis `gsmarena-api/data.json`) : `npm run prt:generate-seed-gsmarena` (variable `SEED_MAX_ROWS`, défaut 1520)  
  Import en base : `npm run prt:seed` (après migration Supabase + variables `SUPABASE_*` service role).

Le facteur Afrique par défaut côté import est **1** (PRT = médiane eBay × EUR→FCFA — voir `tekh_backend/backend/lib/ebay.mjs`).

Les **prix affichés dans l’app** viennent des colonnes **`prt_fcfa` / `prix_ebay_eur`** en base après `prt:resync-all-ebay` ou `prt:sync-prices` — pas d’appel eBay à chaque chargement de page.

Pour **combler les PRT encore vides** à partir de la référence CSV `tekh_backend/backend/tab.csv.bak` : `npm run prt:fill-from-tab-csv` (variable `TAB_CSV_PATH` optionnelle).

Ne pas committer de clés secrètes ; uniquement des données catalogue publiques.
