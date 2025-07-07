-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author_id uuid,
  author_name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['dating-tips'::text, 'success-stories'::text, 'lifestyle'::text, 'news'::text])),
  image_url text,
  tags ARRAY DEFAULT '{}'::text[],
  published boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.community_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time time without time zone NOT NULL,
  location text NOT NULL,
  max_participants integer NOT NULL DEFAULT 50,
  current_participants integer DEFAULT 0,
  category text NOT NULL CHECK (category = ANY (ARRAY['social'::text, 'romantic'::text, 'cultural'::text, 'sports'::text])),
  image_url text,
  organizer_id uuid,
  price numeric DEFAULT 0,
  status text DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_events_pkey PRIMARY KEY (id),
  CONSTRAINT community_events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.compatibility_answers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  answers jsonb NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT compatibility_answers_pkey PRIMARY KEY (id),
  CONSTRAINT compatibility_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_participants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'attended'::text])),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_participants_pkey PRIMARY KEY (id),
  CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.community_events(id),
  CONSTRAINT event_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  liked_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_super_like boolean DEFAULT false,
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT likes_liked_user_id_fkey FOREIGN KEY (liked_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  matched_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'mutual'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT matches_matched_user_id_fkey FOREIGN KEY (matched_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  read boolean DEFAULT false,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'emoji'::text])),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['like'::text, 'match'::text, 'message'::text, 'profile_view'::text, 'system'::text])),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.photos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT photos_pkey PRIMARY KEY (id),
  CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  viewer_id uuid NOT NULL,
  viewed_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_views_pkey PRIMARY KEY (id),
  CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id),
  CONSTRAINT profile_views_viewed_user_id_fkey FOREIGN KEY (viewed_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 100),
  location text NOT NULL,
  bio text DEFAULT ''::text,
  interests ARRAY DEFAULT '{}'::text[],
  photos ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_online boolean DEFAULT true,
  last_seen timestamp with time zone DEFAULT now(),
  gender text NOT NULL CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  looking_for text NOT NULL CHECK (looking_for = ANY (ARRAY['male'::text, 'female'::text, 'both'::text])),
  occupation text DEFAULT ''::text,
  education text DEFAULT ''::text,
  height integer DEFAULT 0,
  relationship_status text DEFAULT 'single'::text CHECK (relationship_status = ANY (ARRAY['single'::text, 'divorced'::text, 'widowed'::text])),
  has_children boolean DEFAULT false,
  wants_children boolean DEFAULT false,
  languages ARRAY DEFAULT '{}'::text[],
  religion text DEFAULT ''::text,
  ethnicity text DEFAULT ''::text,
  body_type text DEFAULT ''::text,
  smoking text DEFAULT 'never'::text CHECK (smoking = ANY (ARRAY['never'::text, 'occasionally'::text, 'regularly'::text])),
  drinking text DEFAULT 'never'::text CHECK (drinking = ANY (ARRAY['never'::text, 'occasionally'::text, 'regularly'::text])),
  is_verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'moderator'::text])),
  credits integer DEFAULT 100,
  verification_status text DEFAULT 'none'::text CHECK (verification_status = ANY (ARRAY['none'::text, 'pending'::text, 'verified'::text, 'rejected'::text])),
  compatibility_completed boolean DEFAULT false,
  compatibility_score integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason = ANY (ARRAY['inappropriate_content'::text, 'fake_profile'::text, 'harassment'::text, 'spam'::text, 'other'::text])),
  description text DEFAULT ''::text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.super_like_usage (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  CONSTRAINT super_like_usage_pkey PRIMARY KEY (id),
  CONSTRAINT super_like_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.verification_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['photo'::text, 'phone'::text, 'document'::text])),
  data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT verification_requests_pkey PRIMARY KEY (id),
  CONSTRAINT verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.virtual_gifts_sent (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  gift_id text NOT NULL,
  gift_name text NOT NULL,
  gift_icon text NOT NULL,
  price integer NOT NULL,
  message text DEFAULT ''::text,
  status text DEFAULT 'sent'::text CHECK (status = ANY (ARRAY['sent'::text, 'received'::text, 'returned'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT virtual_gifts_sent_pkey PRIMARY KEY (id),
  CONSTRAINT virtual_gifts_sent_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT virtual_gifts_sent_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id)
);