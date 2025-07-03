/*
  # Configuration pour l'authentification Google

  1. Configuration
    - Activer l'authentification Google dans Supabase
    - Configurer les redirections appropriées

  2. Sécurité
    - Maintenir les politiques RLS existantes
    - Gérer les profils créés via Google OAuth

  3. Fonctionnalités
    - Création automatique de profil pour les nouveaux utilisateurs Google
    - Gestion des métadonnées utilisateur
*/

-- Fonction pour créer automatiquement un profil lors de l'inscription via Google
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si un profil existe déjà
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Créer un profil de base avec les informations disponibles
    INSERT INTO profiles (
      id,
      email,
      full_name,
      age,
      location,
      gender,
      looking_for,
      bio,
      photos,
      interests,
      is_online,
      last_seen,
      occupation,
      education,
      height,
      relationship_status,
      has_children,
      wants_children,
      languages,
      religion,
      ethnicity,
      body_type,
      smoking,
      drinking,
      is_verified,
      is_premium,
      is_active
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Utilisateur'),
      25, -- Âge par défaut, à modifier par l'utilisateur
      '', -- Localisation à remplir par l'utilisateur
      'female', -- Genre par défaut, à modifier par l'utilisateur
      'male', -- Préférence par défaut, à modifier par l'utilisateur
      '',
      '{}',
      '{}',
      true,
      NOW(),
      '',
      '',
      0,
      'single',
      false,
      false,
      '{}',
      '',
      '',
      '',
      'never',
      'never',
      false,
      false,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fonction pour mettre à jour le profil avec les informations Google
CREATE OR REPLACE FUNCTION update_profile_from_google_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le profil avec les nouvelles informations si disponibles
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    UPDATE profiles SET
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        full_name
      ),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les mises à jour d'utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION update_profile_from_google_auth();