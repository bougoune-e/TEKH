-- Autoriser les utilisateurs authentifiés à lire leurs propres abonnements push.
-- Le comptage admin passe par le backend (service role) mais cette politique
-- permet aux utilisateurs de vérifier leur propre statut d'abonnement.

DROP POLICY IF EXISTS "Authenticated can read own subscription" ON push_subscriptions;
CREATE POLICY "Authenticated can read own subscription"
  ON push_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);
