import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
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
  is_verified?: boolean
  is_premium?: boolean
  is_active?: boolean
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
  is_super_like?: boolean
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'match' | 'message' | 'profile_view' | 'system'
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}