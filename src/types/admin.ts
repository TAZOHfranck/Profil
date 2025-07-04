export interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  created_at: string
  last_login: string
  permissions: string[]
}

export interface UserStats {
  total_users: number
  active_users: number
  premium_users: number
  verified_users: number
  new_users_today: number
  new_users_week: number
  new_users_month: number
}

export interface MatchStats {
  total_matches: number
  matches_today: number
  matches_week: number
  matches_month: number
  average_matches_per_user: number
}

export interface MessageStats {
  total_messages: number
  messages_today: number
  messages_week: number
  messages_month: number
  average_messages_per_user: number
}

export interface ReportedContent {
  id: string
  type: 'profile' | 'message' | 'photo'
  reported_user: {
    id: string
    full_name: string
    email: string
    photos: string[]
  }
  reporter: {
    id: string
    full_name: string
    email: string
  }
  reason: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  content?: any
}

export interface SystemSettings {
  app_name: string
  maintenance_mode: boolean
  registration_enabled: boolean
  email_verification_required: boolean
  max_photos_per_user: number
  premium_price_monthly: number
  premium_price_yearly: number
  super_likes_free: number
  super_likes_premium: number
  max_age: number
  min_age: number
  featured_users_limit: number
}