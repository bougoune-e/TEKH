-- =============================================================================
-- Migration : colonne subscription (objet d'abonnement Push API)
-- Table : push_subscriptions
-- =============================================================================
-- La colonne subscription stocke l'objet complet retourné par la Push API
-- (endpoint, keys.p256dh, keys.auth), requis par web-push pour envoyer les
-- notifications. Format : JSONB conforme à PushSubscription.toJSON().
-- La colonne endpoint est conservée pour l'unicité et l'upsert (onConflict).
-- =============================================================================

-- 1. Ajouter la colonne subscription (JSONB)
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS subscription JSONB;

COMMENT ON COLUMN push_subscriptions.subscription IS 'Objet PushSubscription (endpoint, keys.p256dh, keys.auth) tel que retourné par PushSubscription.toJSON()';

-- 2. Backfill : construire subscription à partir des colonnes existantes
UPDATE push_subscriptions
SET subscription = jsonb_build_object(
  'endpoint', endpoint,
  'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth)
)
WHERE subscription IS NULL
  AND endpoint IS NOT NULL
  AND p256dh IS NOT NULL
  AND auth IS NOT NULL;

-- 3. Supprimer les lignes invalides (sans subscription après backfill)
DELETE FROM push_subscriptions WHERE subscription IS NULL;

-- 4. Rendre subscription NOT NULL
ALTER TABLE push_subscriptions
  ALTER COLUMN subscription SET NOT NULL;

-- 5. Supprimer les colonnes redondantes p256dh et auth (endpoint conservé pour UNIQUE/upsert)
ALTER TABLE push_subscriptions DROP COLUMN IF EXISTS p256dh;
ALTER TABLE push_subscriptions DROP COLUMN IF EXISTS auth;

-- 6. Contrainte de validation : subscription doit contenir endpoint et keys
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_subscription_valid;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_subscription_valid
  CHECK (
    subscription IS NOT NULL
    AND subscription ? 'endpoint'
    AND subscription ? 'keys'
    AND (subscription->'keys') ? 'p256dh'
    AND (subscription->'keys') ? 'auth'
  );

-- 7. S'assurer que endpoint reste cohérent avec subscription (trigger optionnel)
-- Les nouveaux inserts fournissent subscription + endpoint ; on ne force pas la synchro ici.
