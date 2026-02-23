# Table Supabase pour l'import CSV

L'import au démarrage écrit les produits du CSV dans une table Supabase.

- **Variable d'env (Railway)** : `PRODUCTS_TABLE`. Si non définie, défaut = `produits`.
- Si la table configurée n'existe pas (erreur `PGRST205`), le backend tente un repli sur la table `produits`.

## Créer la table dans Supabase (Dashboard → SQL Editor)

Exécutez ce SQL dans le projet Supabase **production** (celui lié à Railway) :

```sql
-- Table recommandée : produits (ou tableau_prix si vous préférez)
CREATE TABLE IF NOT EXISTS public.produits (
  id BIGSERIAL PRIMARY KEY,
  marques TEXT,
  modele_exact TEXT,
  stockages_gb NUMERIC,
  prix_neuf_en_fcfa NUMERIC,
  classe_equivalence TEXT,
  ram_gb NUMERIC,
  annee_sortie NUMERIC
);

-- RLS : autoriser le service role (backend) à tout faire
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

-- Optionnel : politique pour le service role
CREATE POLICY "Service role full access" ON public.produits
  FOR ALL USING (true) WITH CHECK (true);
```

Après création, redéployer ou redémarrer le service Railway pour relancer l'import.
