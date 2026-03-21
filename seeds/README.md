# Seeds TEKH+

- **`smartphones.json`** — liste de modèles (marque, modèle, variante, année, specs).  
  Généré ou régénéré avec : `npm run prt:generate-seed`  
  Import en base : `npm run prt:seed` (après migration Supabase + variables `SUPABASE_*` service role).

Le facteur Afrique par défaut côté import est **0,90** (voir `tekh_backend/backend/lib/ebay.mjs`).

Ne pas committer de clés secrètes ; uniquement des données catalogue publiques.
