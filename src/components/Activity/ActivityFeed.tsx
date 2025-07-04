import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, Eye, MessageCircle, UserPlus, Star, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'like' | 'view' | 'message' | 'match' | 'join'
  user_id: string
  target_user_id?: string
  created_at: string
  profile: Profile
  target_profile?: Profile
}

const ActivityFeed: React.FC = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'likes' | 'views' | 'matches'>('all')

  useEffect(() => {
    if (user) {
      fetchActivities()
    }
  }, [user, filter])

  const fetchActivities = async () => {
    if (!user) return

    try {
      setLoading(true)
      const activities: Activity[] = []

      // Récupérer les likes reçus
      if (filter === 'all' || filter === 'likes') {
        const { data: likes } = await supabase
          .from('likes')
          .select(`
            *,
            profiles!likes_user_id_fkey(*)
          `)
          .eq('liked_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        likes?.forEach(like => {
          if (like.profiles) {
            activities.push({
              id: like.id,
              type: 'like',
              user_id: like.user_id,
              target_user_id: user.id,
              created_at: like.created_at,
              profile: like.profiles
            })
          }
        })
      }

      // Récupérer les vues de profil
      if (filter === 'all' || filter === 'views') {
        const { data: views } = await supabase
          .from('profile_views')
          .select(`
            *,
            profiles!profile_views_viewer_id_fkey(*)
          `)
          .eq('viewed_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        views?.forEach(view => {
          if (view.profiles) {
            activities.push({
              id: view.id,
              type: 'view',
              user_id: view.viewer_id,
              target_user_id: user.id,
              created_at: view.created_at,
              profile: view.profiles
            })
          }
        })
      }

      // Récupérer les matches
      if (filter === 'all' || filter === 'matches') {
        const { data: matches } = await supabase
          .from('matches')
          .select(`
            *,
            profiles!matches_matched_user_id_fkey(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'mutual')
          .order('created_at', { ascending: false })
          .limit(20)

        matches?.forEach(match => {
          if (match.profiles) {
            activities.push({
              id: match.id,
              type: 'match',
              user_id: match.matched_user_id,
              target_user_id: user.id,
              created_at: match.created_at,
              profile: match.profiles
            })
          }
        })
      }

      // Trier par date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setActivities(activities.slice(0, 50))
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500 fill-current" />
      case 'view':
        return <Eye className="h-5 w-5 text-blue-500" />
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case 'match':
        return <Star className="h-5 w-5 text-yellow-500 fill-current" />
      case 'join':
        return <UserPlus className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'like':
        return `${activity.profile.full_name} a aimé votre profil`
      case 'view':
        return `${activity.profile.full_name} a visité votre profil`
      case 'message':
        return `${activity.profile.full_name} vous a envoyé un message`
      case 'match':
        return `Nouveau match avec ${activity.profile.full_name} !`
      case 'join':
        return `${activity.profile.full_name} a rejoint AfrointroductionsHub`
      default:
        return 'Activité inconnue'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'border-l-red-500 bg-red-50'
      case 'view':
        return 'border-l-blue-500 bg-blue-50'
      case 'message':
        return 'border-l-green-500 bg-green-50'
      case 'match':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'join':
        return 'border-l-purple-500 bg-purple-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activités récentes</h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Toutes', icon: Clock },
            { key: 'likes', label: 'Likes', icon: Heart },
            { key: 'views', label: 'Vues', icon: Eye },
            { key: 'matches', label: 'Matches', icon: Star }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                filter === key
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 border-l-4 ${getActivityColor(activity.type)} hover:bg-opacity-75 transition-colors`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.profile.photos && activity.profile.photos.length > 0 ? (
                      <img
                        src={activity.profile.photos[0]}
                        alt={activity.profile.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center ${activity.profile.photos && activity.profile.photos.length > 0 ? 'hidden' : ''}`}>
                      <span className="text-white font-bold">
                        {activity.profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getActivityIcon(activity.type)}
                      <p className="text-sm font-medium text-gray-900">
                        {getActivityText(activity)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>

                  {activity.profile.is_premium && (
                    <div className="flex-shrink-0">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune activité récente
            </h3>
            <p className="text-gray-500">
              Les interactions avec votre profil apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed