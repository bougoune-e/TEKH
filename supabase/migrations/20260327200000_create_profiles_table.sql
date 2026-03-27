-- Création de la table profiles (profils publics utilisateurs)
-- Liée à auth.users via trigger pour auto-création

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes admin triées par updated_at
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC NULLS LAST);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Lecture publique de tous les profils (nécessaire pour l'admin)
DROP POLICY IF EXISTS "Lecture publique des profils" ON profiles;
CREATE POLICY "Lecture publique des profils"
  ON profiles FOR SELECT
  USING (true);

-- Chaque utilisateur peut mettre à jour son propre profil
DROP POLICY IF EXISTS "Utilisateur peut modifier son profil" ON profiles;
CREATE POLICY "Utilisateur peut modifier son profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger : créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill : créer les profils pour les utilisateurs existants qui n'en ont pas
INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  COALESCE(u.updated_at, now())
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
