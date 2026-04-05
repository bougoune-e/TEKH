-- Permet à l'admin (authentifié) d'insérer des crédits TekhPoints.
-- La sécurité applicative (AdminRoute) restreint l'accès à l'interface.

DROP POLICY IF EXISTS "admin_insert_tekh_points" ON public.tekh_point_credits;
CREATE POLICY "admin_insert_tekh_points"
  ON public.tekh_point_credits FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_tekh_points" ON public.tekh_point_credits;
CREATE POLICY "admin_update_tekh_points"
  ON public.tekh_point_credits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin peut lire tous les crédits (pas seulement les siens)
DROP POLICY IF EXISTS "admin_select_all_tekh_points" ON public.tekh_point_credits;
CREATE POLICY "admin_select_all_tekh_points"
  ON public.tekh_point_credits FOR SELECT
  TO authenticated
  USING (true);
