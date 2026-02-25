-- Buckets Storage pour les images des deals (phones) et avatars
-- À exécuter dans Supabase Dashboard → SQL Editor.
-- Si l’INSERT échoue (ex. schéma différent), crée les buckets à la main :
-- Storage → New bucket → id "phones", public ✓ ; id "avatars", public ✓. Puis exécuter uniquement les CREATE POLICY ci‑dessous.

-- Créer le bucket "phones" (images des annonces / deals) – public pour lecture des images
INSERT INTO storage.buckets (id, name, public)
VALUES ('phones', 'phones', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Créer le bucket "avatars" (photos de profil) – public pour affichage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politiques RLS sur storage.objects pour autoriser les uploads
-- (Si une politique existe déjà, la supprimer dans le Dashboard puis réexécuter, ou ignorer l’erreur.)

-- phones : tout utilisateur authentifié peut uploader (admin + propriétaires d’annonces)
DROP POLICY IF EXISTS "Authenticated can upload to phones" ON storage.objects;
CREATE POLICY "Authenticated can upload to phones"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'phones');

-- phones : tout le monde peut lire (bucket public)
DROP POLICY IF EXISTS "Public read phones" ON storage.objects;
CREATE POLICY "Public read phones"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'phones');

-- phones : authentifié peut mettre à jour / supprimer
DROP POLICY IF EXISTS "Owner or admin can update phones" ON storage.objects;
CREATE POLICY "Owner or admin can update phones"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'phones')
WITH CHECK (bucket_id = 'phones');

DROP POLICY IF EXISTS "Owner or admin can delete phones" ON storage.objects;
CREATE POLICY "Owner or admin can delete phones"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'phones');

-- avatars : tout utilisateur authentifié peut uploader
DROP POLICY IF EXISTS "Authenticated can upload to avatars" ON storage.objects;
CREATE POLICY "Authenticated can upload to avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- avatars : lecture publique
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated can update avatars" ON storage.objects;
CREATE POLICY "Authenticated can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
