-- =============================================================================
-- push_subscriptions : création de la table + colonne subscription (objet Push API)
-- =============================================================================
-- À exécuter dans Supabase → SQL Editor si la table n'existe pas encore.
-- Crée la table avec endpoint + subscription (objet complet : endpoint, keys.p256dh, keys.auth).
-- Si la table existe déjà avec l'ancien schéma (p256dh, auth), ajoute subscription et migre.
-- =============================================================================

-- 1. Créer la table si elle n'existe pas (schéma final : endpoint + subscription)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  endpoint TEXT NOT NULL,
  subscription JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

-- 2. Si la table existait avec l'ancien schéma (p256dh, auth), ajouter subscription et migrer
DO $$
BEGIN
  -- Ajouter subscription si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'subscription'
  ) THEN
    ALTER TABLE push_subscriptions ADD COLUMN subscription JSONB;
    UPDATE push_subscriptions
    SET subscription = jsonb_build_object(
      'endpoint', endpoint,
      'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth)
    )
    WHERE endpoint IS NOT NULL AND p256dh IS NOT NULL AND auth IS NOT NULL;
    DELETE FROM push_subscriptions WHERE subscription IS NULL;
    ALTER TABLE push_subscriptions ALTER COLUMN subscription SET NOT NULL;
    ALTER TABLE push_subscriptions DROP COLUMN IF EXISTS p256dh;
    ALTER TABLE push_subscriptions DROP COLUMN IF EXISTS auth;
  END IF;
END $$;

-- 3. Contrainte de validation sur subscription (endpoint + keys.p256dh + keys.auth)
ALTER TABLE push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_subscription_valid;
ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_subscription_valid
  CHECK (
    subscription IS NOT NULL
    AND subscription ? 'endpoint'
    AND subscription ? 'keys'
    AND (subscription->'keys') ? 'p256dh'
    AND (subscription->'keys') ? 'auth'
  );

-- 4. Index et commentaires
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at DESC);

COMMENT ON TABLE push_subscriptions IS 'Web Push subscriptions for PWA notifications (new deals). subscription = objet PushSubscription.toJSON().';
COMMENT ON COLUMN push_subscriptions.subscription IS 'Objet complet (endpoint, keys.p256dh, keys.auth) retourné par la Push API.';

-- 5. RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own subscription" ON push_subscriptions;
CREATE POLICY "Users can insert own subscription"
  ON push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own subscription" ON push_subscriptions;
CREATE POLICY "Users can delete own subscription"
  ON push_subscriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);
