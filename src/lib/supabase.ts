import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types pour la base de données
export interface Profile {
  id: string
  email: string
  full_name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  created_at: string
  updated_at: string
  is_online: boolean
  last_seen: string
  gender: 'male' | 'female' | 'other'
  looking_for: 'male' | 'female' | 'both'
  occupation: string
  education: string
  height: number
  relationship_status: 'single' | 'divorced' | 'widowed'
  has_children: boolean
  wants_children: boolean
  languages: string[]
  religion: string
  ethnicity: string
  body_type: string
  smoking: 'never' | 'occasionally' | 'regularly'
  drinking: 'never' | 'occasionally' | 'regularly'
<<<<<<< HEAD
  is_verified: boolean
  is_premium: boolean
  is_active: boolean
  role: 'user' | 'admin' | 'moderator'
  credits: number
  verification_status: 'none' | 'pending' | 'verified' | 'rejected'
  compatibility_completed: boolean
  compatibility_score: number
=======
  is_verified?: boolean
  is_premium?: boolean
  is_active?: boolean
>>>>>>> 02f49e807f8a2ece04a1a17938e62aac9ee127d3
}

export interface Match {
  id: string
  user_id: string
  matched_user_id: string
  status: 'pending' | 'mutual' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
  message_type: 'text' | 'image' | 'emoji'
}

export interface Like {
  id: string
  user_id: string
  liked_user_id: string
  created_at: string
<<<<<<< HEAD
  is_super_like: boolean
=======
  is_super_like?: boolean
>>>>>>> 02f49e807f8a2ece04a1a17938e62aac9ee127d3
}

export interface Notification {
  id: string
  user_id: string
<<<<<<< HEAD
  type: 'like' | 'match' | 'message' | 'profile_view' | 'system' | 'gift'
=======
  type: 'like' | 'match' | 'message' | 'profile_view' | 'system'
>>>>>>> 02f49e807f8a2ece04a1a17938e62aac9ee127d3
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
<<<<<<< HEAD
}

export interface VirtualGift {
  id: string
  sender_id: string
  recipient_id: string
  gift_id: string
  gift_name: string
  gift_icon: string
  price: number
  message: string
  status: 'sent' | 'received' | 'returned'
  created_at: string
}

export interface CommunityEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  max_participants: number
  current_participants: number
  category: 'social' | 'romantic' | 'cultural' | 'sports'
  image_url?: string
  organizer_id: string
  price: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
}

export interface VerificationRequest {
  id: string
  user_id: string
  type: 'photo' | 'phone' | 'document'
  data: any
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
=======
>>>>>>> 02f49e807f8a2ece04a1a17938e62aac9ee127d3
}