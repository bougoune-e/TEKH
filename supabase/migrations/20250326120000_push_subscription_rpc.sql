-- Enregistrement push sans friction RLS : fonction SECURITY DEFINER (auth.uid() côté serveur).
-- À appliquer sur Supabase si les politiques RLS bloquent encore l'upsert client.

CREATE OR REPLACE FUNCTION public.upsert_push_subscription(
  p_endpoint text,
  p_subscription jsonb,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF p_endpoint IS NULL OR length(trim(p_endpoint)) < 10 THEN
    RAISE EXCEPTION 'endpoint invalide';
  END IF;
  IF p_subscription IS NULL OR NOT (p_subscription ? 'endpoint') THEN
    RAISE EXCEPTION 'subscription invalide';
  END IF;

  INSERT INTO public.push_subscriptions (endpoint, subscription, user_id, user_agent)
  VALUES (p_endpoint, p_subscription, v_uid, p_user_agent)
  ON CONFLICT (endpoint) DO UPDATE SET
    subscription = EXCLUDED.subscription,
    user_id = COALESCE(v_uid, public.push_subscriptions.user_id),
    user_agent = COALESCE(EXCLUDED.user_agent, public.push_subscriptions.user_agent);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_push_subscription(p_endpoint text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.push_subscriptions
  WHERE endpoint = p_endpoint
    AND (user_id IS NULL OR user_id = auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_push_subscription(text, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_push_subscription(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_push_subscription(text, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_push_subscription(text) TO anon, authenticated;

COMMENT ON FUNCTION public.upsert_push_subscription IS 'Web Push : upsert abonnement (JWT → user_id).';
