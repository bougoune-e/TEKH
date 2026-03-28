-- Fonction SECURITY DEFINER pour que l'admin puisse compter les abonnés push
-- directement depuis le frontend sans passer par le backend (contourne le RLS).

CREATE OR REPLACE FUNCTION public.count_push_subscriptions()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*) FROM public.push_subscriptions;
$$;

REVOKE ALL ON FUNCTION public.count_push_subscriptions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_push_subscriptions() TO authenticated;

COMMENT ON FUNCTION public.count_push_subscriptions IS
  'Retourne le nombre total d''abonnements push. SECURITY DEFINER contourne le RLS. Réservé aux utilisateurs authentifiés.';
