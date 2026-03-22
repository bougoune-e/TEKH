-- Corrige les erreurs RLS sur upsert / utilisateurs non connectés (notifications push).
-- 1) Les invités peuvent insérer un abonnement (user_id NULL).
-- 2) L'upsert (ON CONFLICT DO UPDATE) nécessite une politique UPDATE.

DROP POLICY IF EXISTS "Anonymous can insert push subscription" ON push_subscriptions;
CREATE POLICY "Anonymous can insert push subscription"
  ON push_subscriptions FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own subscription" ON push_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON push_subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Mise à jour de la même ligne (même endpoint) pour les invités : uniquement lignes anonymes
DROP POLICY IF EXISTS "Anonymous can update own push subscription" ON push_subscriptions;
CREATE POLICY "Anonymous can update own push subscription"
  ON push_subscriptions FOR UPDATE TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);
