-- Abonnements Web Push pour les notifications (nouveaux deals publiés par l’admin)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at DESC);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Seul le propriétaire peut insérer/supprimer son abonnement ; lecture réservée au backend (service role)
CREATE POLICY "Users can insert own subscription"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own subscription"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Lecture : service role uniquement (pour l’envoi des notifications)
COMMENT ON TABLE push_subscriptions IS 'Web Push subscriptions for PWA notifications (new deals, etc.)';
