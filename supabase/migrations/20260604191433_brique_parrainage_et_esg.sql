-- 1. Enrichissement de la table profiles pour le parrainage et l'ESG
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS total_co2_saved NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_status TEXT DEFAULT 'none' CHECK (reward_status IN ('none', 'eligible', 'claimed'));

COMMENT ON COLUMN public.profiles.referral_code IS 'Code unique de parrainage (ex: TEKH-A1B2)';
COMMENT ON COLUMN public.profiles.total_co2_saved IS 'Impact écologique cumulé en kg de CO2 (via parrainages et achats)';

-- 2. Fonction utilitaire pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- O et 0, I et 1 exclus pour lisibilité
  result TEXT := 'TEKH-';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. Backfill : Générer des codes pour les utilisateurs existants sans code
UPDATE public.profiles 
SET referral_code = public.generate_referral_code() 
WHERE referral_code IS NULL;

-- 4. Table des parrainages (Anti-fraude via fingerprint)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ,
  
  -- Un filleul ne peut être parrainé qu'une seule fois
  CONSTRAINT unique_referee UNIQUE (referee_id),
  -- On ne peut pas se parrainer soi-même
  CONSTRAINT no_self_referral CHECK (referrer_id <> referee_id)
);

-- Index pour la détection de fraude et les perfs
CREATE INDEX IF NOT EXISTS idx_referrals_fingerprint ON public.referrals(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- 5. RLS pour referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Un parrain peut voir ses propres parrainages
CREATE POLICY "Parrains peuvent voir leurs filleuls"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Un filleul peut voir son propre lien de parrainage
CREATE POLICY "Filleuls peuvent voir leur lien"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referee_id);

-- Insertion autorisée pour les utilisateurs authentifiés (lors du onboarding)
CREATE POLICY "Utilisateurs peuvent insérer un parrainage"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referee_id);

-- 6. Trigger pour l'impact ESG (Passage à 'converted')
-- Chaque parrainage converti ajoute environ 5.4kg de CO2 (moyenne cycle de vie smartphone évité)
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status = 'pending' AND NEW.status = 'converted') THEN
    UPDATE public.profiles
    SET total_co2_saved = total_co2_saved + 5.4,
        updated_at = now()
    WHERE id = NEW.referrer_id;
    
    -- Vérification de l'éligibilité à la récompense (ex: 5 filleuls)
    UPDATE public.profiles
    SET reward_status = 'eligible'
    WHERE id = NEW.referrer_id 
      AND reward_status = 'none'
      AND (SELECT count(*) FROM public.referrals WHERE referrer_id = NEW.referrer_id AND status = 'converted') >= 5;
      
    NEW.converted_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_on_referral_converted
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_conversion();
