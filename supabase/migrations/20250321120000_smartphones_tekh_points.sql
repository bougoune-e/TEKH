-- TEKH+ : référentiel smartphones (PRT / cache) + crédits TekhPoints
-- Exécuter via Supabase CLI ou SQL Editor après revue.

-- ---------------------------------------------------------------------------
-- smartphones : cache PRT + specs (source primaire pour l’app)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.smartphones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  variante TEXT NOT NULL DEFAULT '',
  annee_sortie INTEGER,
  statut TEXT NOT NULL DEFAULT 'disponible'
    CHECK (statut IN ('disponible', 'upcoming', 'discontinue')),
  classe_tekh CHAR(1)
    CHECK (classe_tekh IS NULL OR classe_tekh IN ('A', 'B', 'C', 'D', 'E', 'F')),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  prt_fcfa INTEGER CHECK (prt_fcfa IS NULL OR prt_fcfa >= 0),
  prix_ebay_eur NUMERIC(12, 2),
  facteur_afrique NUMERIC(6, 4) NOT NULL DEFAULT 0.9000,
  prt_updated_at TIMESTAMPTZ,
  specs_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.smartphones IS 'Référentiel modèles TEKH+ ; PRT depuis eBay (cache, refresh ~30j).';
COMMENT ON COLUMN public.smartphones.specs IS 'JSON libre : ecran_taille, ram_gb, stockage_gb, reseau, 5g, etc.';

CREATE INDEX IF NOT EXISTS idx_smartphones_marque_annee ON public.smartphones (marque, annee_sortie);
CREATE INDEX IF NOT EXISTS idx_smartphones_classe ON public.smartphones (classe_tekh);
CREATE INDEX IF NOT EXISTS idx_smartphones_prt_updated ON public.smartphones (prt_updated_at NULLS FIRST);

-- Unicité pour upsert côté scripts (variante vide '' si non précisée)
CREATE UNIQUE INDEX IF NOT EXISTS idx_smartphones_unique_triplet
  ON public.smartphones (marque, modele, variante);

CREATE OR REPLACE FUNCTION public.set_smartphones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_smartphones_updated_at ON public.smartphones;
CREATE TRIGGER trg_smartphones_updated_at
  BEFORE UPDATE ON public.smartphones
  FOR EACH ROW EXECUTE FUNCTION public.set_smartphones_updated_at();

ALTER TABLE public.smartphones ENABLE ROW LEVEL SECURITY;

-- Lecture publique (catalogue / estimation) — pas de données perso
DROP POLICY IF EXISTS "smartphones_select_public" ON public.smartphones;
CREATE POLICY "smartphones_select_public"
  ON public.smartphones FOR SELECT
  USING (true);

-- Écritures réservées au service role / backend (clé service) — pas de policy INSERT pour anon

-- ---------------------------------------------------------------------------
-- tekh_point_credits : crédits TekhPoints (1 pt = 1 FCFA)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tekh_point_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa > 0),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tekh_point_credits IS 'Crédits TekhPoints ; expiration 6 mois ; usage max 30% par transaction (appli métier).';

CREATE INDEX IF NOT EXISTS idx_tekh_points_user ON public.tekh_point_credits (user_id);
CREATE INDEX IF NOT EXISTS idx_tekh_points_expires ON public.tekh_point_credits (expires_at);
CREATE INDEX IF NOT EXISTS idx_tekh_points_status ON public.tekh_point_credits (status);

ALTER TABLE public.tekh_point_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tekh_points_select_own" ON public.tekh_point_credits;
CREATE POLICY "tekh_points_select_own"
  ON public.tekh_point_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Pas d’INSERT côté client direct (Edge Function / service role recommandés)
