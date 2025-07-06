/*
  # Schema complet pour l'application de rencontre MeetUp

  1. Tables principales
    - `profiles` - Profils utilisateurs avec informations détaillées
    - `likes` - Système de likes entre utilisateurs
    - `matches` - Correspondances mutuelles
    - `messages` - Système de messagerie
    - `notifications` - Notifications utilisateur
    - `photos` - Photos des profils
    - `reports` - Signalements d'utilisateurs

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques de sécurité appropriées pour chaque table
    - Restrictions d'accès basées sur l'authentification

  3. Fonctionnalités
    - Profils détaillés avec informations personnelles
    - Système de likes et matches
    - Messagerie sécurisée
    - Gestion des photos
    - Système de signalement
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  location TEXT NOT NULL,
  bio TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  looking_for TEXT NOT NULL CHECK (looking_for IN ('male', 'female', 'both')),
  occupation TEXT DEFAULT '',
  education TEXT DEFAULT '',
  height INTEGER DEFAULT 0,
  relationship_status TEXT DEFAULT 'single' CHECK (relationship_status IN ('single', 'divorced', 'widowed')),
  has_children BOOLEAN DEFAULT false,
  wants_children BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT '{}',
  religion TEXT DEFAULT '',
  ethnicity TEXT DEFAULT '',
  body_type TEXT DEFAULT '',
  smoking TEXT DEFAULT 'never' CHECK (smoking IN ('never', 'occasionally', 'regularly')),
  drinking TEXT DEFAULT 'never' CHECK (drinking IN ('never', 'occasionally', 'regularly')),
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Table des likes
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, liked_user_id)
);

-- Table des matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'mutual', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji'))
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'match', 'message', 'profile_view', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des signalements
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate_content', 'fake_profile', 'harassment', 'spam', 'other')),
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reporter_id, reported_user_id)
);

-- Table des vues de profil
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(viewer_id, viewed_user_id)
);

-- Enable RLS pour toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Politiques RLS pour likes
CREATE POLICY "Users can view own likes" ON likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create likes" ON likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Politiques RLS pour matches
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Politiques RLS pour messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Politiques RLS pour notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Politiques RLS pour photos
CREATE POLICY "Users can view all photos" ON photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own photos" ON photos
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Politiques RLS pour reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Politiques RLS pour profile_views
CREATE POLICY "Users can view own profile views" ON profile_views
  FOR SELECT TO authenticated USING (auth.uid() = viewer_id OR auth.uid() = viewed_user_id);

CREATE POLICY "Users can create profile views" ON profile_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_gender_looking_for ON profiles(gender, looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_user_id ON likes(liked_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id ON matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    -- Créer un match mutuel
    INSERT INTO matches (user_id, matched_user_id, status)
    VALUES (NEW.user_id, NEW.liked_user_id, 'mutual')
    ON CONFLICT (user_id, matched_user_id) DO NOTHING;
    
    INSERT INTO matches (user_id, matched_user_id, status)
    VALUES (NEW.liked_user_id, NEW.user_id, 'mutual')
    ON CONFLICT (user_id, matched_user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer des matches automatiquement
CREATE TRIGGER create_match_on_mutual_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_mutual_match();

-- Fonction pour mettre à jour last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = NOW(), is_online = true
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour last_seen lors de l'envoi de messages
CREATE TRIGGER update_user_last_seen_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();