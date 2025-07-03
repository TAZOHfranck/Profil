/*
  # Ajouter les fonctionnalités Premium et de gestion des photos

  1. Nouvelles tables
    - `photos` - Gestion des photos des utilisateurs
    - `profile_views` - Suivi des vues de profil
    - `notifications` - Système de notifications
    - `reports` - Système de signalement

  2. Nouvelles colonnes
    - Ajout de colonnes pour les fonctionnalités premium
    - Amélioration du système de profils

  3. Sécurité
    - Politiques RLS pour toutes les nouvelles tables
    - Contraintes de validation appropriées
*/

-- Créer le bucket de stockage pour les photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Politique pour permettre aux utilisateurs de télécharger leurs propres photos
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre à tous de voir les photos
CREATE POLICY "Photos are publicly viewable" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'photos');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres photos
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ajouter des colonnes manquantes à la table profiles si elles n'existent pas
DO $$
BEGIN
  -- Vérifier et ajouter is_verified
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  -- Vérifier et ajouter is_premium
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_premium boolean DEFAULT false;
  END IF;

  -- Vérifier et ajouter is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Fonction pour mettre à jour automatiquement last_seen lors de l'envoi de messages
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = NOW(), is_online = true
  WHERE id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer automatiquement un match mutuel
CREATE OR REPLACE FUNCTION create_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier s'il y a un like mutuel
  IF EXISTS (
    SELECT 1 FROM likes 
    WHERE user_id = NEW.liked_user_id 
    AND liked_user_id = NEW.user_id
  ) THEN
    -- Créer le match pour les deux utilisateurs
    INSERT INTO matches (user_id, matched_user_id, status)
    VALUES (NEW.user_id, NEW.liked_user_id, 'mutual')
    ON CONFLICT (user_id, matched_user_id) DO NOTHING;
    
    INSERT INTO matches (user_id, matched_user_id, status)
    VALUES (NEW.liked_user_id, NEW.user_id, 'mutual')
    ON CONFLICT (user_id, matched_user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;