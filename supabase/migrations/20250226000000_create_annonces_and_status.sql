-- Création de la table annonces si elle n'existe pas, avec status et published_at
-- À exécuter dans Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS annonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_name TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  condition TEXT,
  description TEXT,
  price INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  storage INTEGER,
  ram INTEGER,
  color TEXT,
  location TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ
);

-- Rétrocompatibilité: lignes sans status = publiées
UPDATE annonces SET status = 'published' WHERE status IS NULL;
UPDATE annonces SET published_at = created_at WHERE published_at IS NULL AND status = 'published';

-- Index
CREATE INDEX IF NOT EXISTS idx_annonces_status ON annonces(status);
CREATE INDEX IF NOT EXISTS idx_annonces_published_at ON annonces(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_annonces_created_at ON annonces(created_at DESC);

-- RLS (optionnel) : autoriser lecture publique des publiés, le reste via service role / auth
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des deals publiés"
  ON annonces FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authentified can manage own"
  ON annonces FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Admin : app_metadata.role = 'ADMIN' (défini côté serveur uniquement, pas modifiable par le client)
CREATE POLICY "Admin full access"
  ON annonces FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

COMMENT ON TABLE annonces IS 'Deals / annonces téléphones (admin = tous, public = status published)';
