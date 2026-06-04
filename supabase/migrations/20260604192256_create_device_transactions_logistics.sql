-- Table des transactions logistiques pour le suivi en temps réel
CREATE TABLE IF NOT EXISTS public.device_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  price_fcfa INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Estimé' 
    CHECK (status IN ('Estimé', 'Déposé en Point Relais', 'En Transit', 'En Réparation', 'Prêt', 'completed')),
  tracking_number TEXT UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexation
CREATE INDEX IF NOT EXISTS idx_device_transactions_user ON public.device_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_transactions_status ON public.device_transactions(status);

-- RLS
ALTER TABLE public.device_transactions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir uniquement leurs propres transactions
DROP POLICY IF EXISTS "Utilisateur peut voir ses transactions" ON public.device_transactions;
CREATE POLICY "Utilisateur peut voir ses transactions"
  ON public.device_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Les admins peuvent tout voir et modifier
DROP POLICY IF EXISTS "Admin full access" ON public.device_transactions;
CREATE POLICY "Admin full access"
  ON public.device_transactions FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Activer le Realtime pour cette table
-- Note: Si la publication 'supabase_realtime' n'existe pas encore, elle sera créée par le dashboard.
-- Ici on s'assure de l'ajout si elle existe.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.device_transactions;
  END IF;
END $$;
