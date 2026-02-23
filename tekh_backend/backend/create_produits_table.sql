-- Copier-coller uniquement ce bloc dans Supabase SQL Editor puis Run

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

ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.produits;
CREATE POLICY "Service role full access" ON public.produits
  FOR ALL USING (true) WITH CHECK (true);
