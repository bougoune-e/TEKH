-- Table pour l'historique des campagnes de notifications push envoyées par l'admin

CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  body        text NOT NULL,
  url         text NOT NULL DEFAULT '/deals',
  tag         text NOT NULL DEFAULT 'tekh-push',
  sent_count  integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  total_subs  integer NOT NULL DEFAULT 0,
  sent_by     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Lecture réservée aux admins (service role uniquement pour les inserts via Edge Function)
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read campaigns" ON public.notification_campaigns
  FOR SELECT USING (true);

CREATE POLICY "Service role insert campaigns" ON public.notification_campaigns
  FOR INSERT WITH CHECK (true);
