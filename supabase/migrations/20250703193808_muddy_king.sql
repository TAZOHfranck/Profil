/*
  # Ajouter les fonctionnalités Super Likes et améliorations

  1. Nouvelles colonnes
    - `is_super_like` dans la table likes
    - Compteurs pour les super likes

  2. Nouvelles tables
    - `super_like_usage` pour suivre l'utilisation quotidienne

  3. Fonctions
    - Gestion des super likes quotidiens
    - Notifications améliorées
*/

-- Ajouter la colonne is_super_like à la table likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'likes' AND column_name = 'is_super_like'
  ) THEN
    ALTER TABLE likes ADD COLUMN is_super_like boolean DEFAULT false;
  END IF;
END $$;

-- Table pour suivre l'utilisation des super likes
CREATE TABLE IF NOT EXISTS super_like_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Enable RLS pour super_like_usage
ALTER TABLE super_like_usage ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour super_like_usage
CREATE POLICY "Users can view own super like usage" ON super_like_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own super like usage" ON super_like_usage
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Fonction pour vérifier et incrémenter l'utilisation des super likes
CREATE OR REPLACE FUNCTION check_super_like_usage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_usage INTEGER;
  max_super_likes INTEGER;
  is_premium_user BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur est premium
  SELECT is_premium INTO is_premium_user
  FROM profiles
  WHERE id = user_uuid;
  
  -- Définir le nombre maximum de super likes
  max_super_likes := CASE WHEN is_premium_user THEN 5 ELSE 1 END;
  
  -- Obtenir l'utilisation actuelle pour aujourd'hui
  SELECT COALESCE(count, 0) INTO current_usage
  FROM super_like_usage
  WHERE user_id = user_uuid AND date = CURRENT_DATE;
  
  -- Si pas d'enregistrement, créer un
  IF current_usage IS NULL THEN
    INSERT INTO super_like_usage (user_id, date, count)
    VALUES (user_uuid, CURRENT_DATE, 0)
    ON CONFLICT (user_id, date) DO NOTHING;
    current_usage := 0;
  END IF;
  
  RETURN max_super_likes - current_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter l'utilisation des super likes
CREATE OR REPLACE FUNCTION increment_super_like_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO super_like_usage (user_id, date, count)
  VALUES (user_uuid, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = super_like_usage.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour incrémenter automatiquement l'utilisation des super likes
CREATE OR REPLACE FUNCTION handle_super_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_super_like = true THEN
    PERFORM increment_super_like_usage(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_super_like_created ON likes;
CREATE TRIGGER on_super_like_created
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_super_like();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_super_like_usage_user_date ON super_like_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_likes_is_super_like ON likes(is_super_like);

-- Fonction pour nettoyer les anciens enregistrements (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_super_like_usage()
RETURNS VOID AS $$
BEGIN
  DELETE FROM super_like_usage
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;