/*
  # Fonctionnalités complètes pour MeetUp

  1. Nouvelles tables
    - `verification_requests` - Demandes de vérification
    - `virtual_gifts_sent` - Cadeaux virtuels envoyés
    - `compatibility_answers` - Réponses au test de compatibilité
    - `community_events` - Événements communautaires
    - `event_participants` - Participants aux événements
    - `blog_posts` - Articles de blog
    - `user_credits` - Système de crédits

  2. Nouvelles colonnes
    - Ajout de colonnes pour les nouvelles fonctionnalités
    - Système de rôles pour l'administration

  3. Fonctions et triggers
    - Gestion automatique des événements
    - Système de crédits
*/

-- Table des demandes de vérification
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'phone', 'document')),
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des cadeaux virtuels envoyés
CREATE TABLE IF NOT EXISTS virtual_gifts_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_icon TEXT NOT NULL,
  price INTEGER NOT NULL,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'returned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réponses au test de compatibilité
CREATE TABLE IF NOT EXISTS compatibility_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table des événements communautaires
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 50,
  current_participants INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('social', 'romantic', 'cultural', 'sports')),
  image_url TEXT,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des participants aux événements
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Table des articles de blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dating-tips', 'success-stories', 'lifestyle', 'news')),
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter des colonnes manquantes aux profils
DO $$
BEGIN
  -- Ajouter role pour l'administration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;

  -- Ajouter credits pour les cadeaux virtuels
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'credits'
  ) THEN
    ALTER TABLE profiles ADD COLUMN credits INTEGER DEFAULT 100;
  END IF;

  -- Ajouter verification_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));
  END IF;

  -- Ajouter compatibility_completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'compatibility_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN compatibility_completed BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter compatibility_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'compatibility_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN compatibility_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- Enable RLS pour toutes les nouvelles tables
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_gifts_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour verification_requests
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests" ON verification_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verification requests" ON verification_requests
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Politiques RLS pour virtual_gifts_sent
CREATE POLICY "Users can view own gifts" ON virtual_gifts_sent
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send gifts" ON virtual_gifts_sent
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Politiques RLS pour compatibility_answers
CREATE POLICY "Users can manage own compatibility answers" ON compatibility_answers
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Politiques RLS pour community_events
CREATE POLICY "Everyone can view published events" ON community_events
  FOR SELECT TO authenticated USING (status = 'upcoming');

CREATE POLICY "Users can create events" ON community_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events" ON community_events
  FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);

-- Politiques RLS pour event_participants
CREATE POLICY "Users can view event participants" ON event_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own participation" ON event_participants
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Politiques RLS pour blog_posts
CREATE POLICY "Everyone can view published posts" ON blog_posts
  FOR SELECT TO public USING (published = true);

CREATE POLICY "Admins can manage all posts" ON blog_posts
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_virtual_gifts_sender_id ON virtual_gifts_sent(sender_id);
CREATE INDEX IF NOT EXISTS idx_virtual_gifts_recipient_id ON virtual_gifts_sent(recipient_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_answers_user_id ON compatibility_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events(date);
CREATE INDEX IF NOT EXISTS idx_community_events_category ON community_events(category);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Fonctions pour gérer les participants aux événements
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_events 
  SET current_participants = current_participants + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_events 
  SET current_participants = GREATEST(0, current_participants - 1)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour updated_at sur blog_posts
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Créer un bucket de stockage pour les vérifications
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification', 'verification', false)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs de télécharger leurs documents de vérification
CREATE POLICY "Users can upload verification documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre aux admins de voir les documents de vérification
CREATE POLICY "Admins can view verification documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Insérer quelques événements par défaut
INSERT INTO community_events (
  title, 
  description, 
  date, 
  time, 
  location, 
  max_participants, 
  category, 
  organizer_id, 
  price
) VALUES 
(
  'Soirée rencontre célibataires',
  'Une soirée conviviale pour rencontrer de nouvelles personnes dans une ambiance détendue.',
  CURRENT_DATE + INTERVAL '7 days',
  '19:00',
  'Café Central, Paris',
  30,
  'social',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  15.00
),
(
  'Atelier cuisine en couple',
  'Apprenez à cuisiner ensemble dans une ambiance romantique.',
  CURRENT_DATE + INTERVAL '14 days',
  '14:00',
  'École de cuisine, Lyon',
  20,
  'romantic',
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  45.00
)
ON CONFLICT DO NOTHING;