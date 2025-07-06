/*
  # Fonctionnalités complètes pour MeetUp

  1. Nouvelles tables
    - `verification_requests` - Demandes de vérification d'identité
    - `virtual_gifts_sent` - Cadeaux virtuels envoyés
    - `compatibility_answers` - Réponses au test de compatibilité
    - `community_events` - Événements communautaires
    - `event_participants` - Participants aux événements
    - `blog_posts` - Articles de blog

  2. Nouvelles colonnes
    - Ajout de colonnes pour l'administration et les nouvelles fonctionnalités

  3. Sécurité
    - Enable RLS sur toutes les nouvelles tables
    - Politiques de sécurité appropriées
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
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

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

-- Insérer quelques articles de blog par défaut
INSERT INTO blog_posts (
  title, 
  excerpt, 
  content, 
  author_name, 
  category, 
  published,
  published_at,
  tags
) VALUES 
(
  'Comment créer un profil attractif',
  'Découvrez les secrets pour créer un profil qui attire l''attention et génère des matches.',
  'Un profil attractif commence par de bonnes photos. Choisissez des images récentes qui vous représentent fidèlement. Votre photo principale doit être claire, avec un sourire naturel. Évitez les selfies dans la salle de bain ou les photos de groupe où on ne vous distingue pas.

Pour la description, soyez authentique et positif. Parlez de vos passions, de ce qui vous rend unique. Évitez les clichés comme "j''aime voyager" sans donner de détails. Préférez "J''ai exploré 15 pays et mon prochain objectif est le Japon".

N''oubliez pas de remplir toutes les sections de votre profil. Plus votre profil est complet, plus vous avez de chances d''attirer des personnes compatibles.',
  'Équipe MeetUp',
  'dating-tips',
  true,
  NOW(),
  ARRAY['profil', 'photos', 'conseils', 'attraction']
),
(
  'Notre histoire d''amour a commencé ici',
  'Marie et Jean racontent comment ils se sont rencontrés sur MeetUp.',
  'Marie, 28 ans, et Jean, 32 ans, se sont rencontrés sur MeetUp en janvier 2024. Après plusieurs semaines d''échanges, ils ont décidé de se rencontrer autour d''un café.

"Ce qui m''a plu chez Jean, c''est sa sincérité dans ses messages. Il prenait le temps de lire mon profil et posait des questions pertinentes", raconte Marie.

De son côté, Jean appréciait l''authenticité de Marie : "Son profil était complet et honnête. On sentait qu''elle cherchait vraiment une relation sérieuse."

Aujourd''hui, six mois plus tard, ils vivent ensemble et préparent leurs fiançailles. "MeetUp nous a permis de nous trouver malgré nos emplois du temps chargés", concluent-ils.',
  'Équipe MeetUp',
  'success-stories',
  true,
  NOW(),
  ARRAY['témoignage', 'couple', 'réussite', 'amour']
),
(
  'Les tendances rencontres en 2025',
  'Découvrez comment les habitudes de rencontre évoluent et comment vous adapter.',
  'Les rencontres en ligne continuent d''évoluer en 2025. Voici les principales tendances :

**1. L''authenticité avant tout**
Les utilisateurs privilégient désormais les profils authentiques aux photos trop retouchées. La vérification d''identité devient un critère important.

**2. Les rencontres vidéo**
Avant le premier rendez-vous physique, beaucoup préfèrent un appel vidéo pour vérifier la compatibilité.

**3. Les valeurs communes**
Au-delà de l''attraction physique, les utilisateurs recherchent des partenaires partageant leurs valeurs et objectifs de vie.

**4. La slow dating**
Prendre le temps d''apprendre à se connaître avant de se rencontrer devient la norme.

Ces tendances montrent une maturité croissante dans l''approche des rencontres en ligne.',
  'Équipe MeetUp',
  'lifestyle',
  true,
  NOW(),
  ARRAY['tendances', '2025', 'évolution', 'rencontres']
)
ON CONFLICT DO NOTHING;