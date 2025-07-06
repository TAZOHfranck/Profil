import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Circle, MessageCircle, Heart } from 'lucide-react'

const OnlineUsers: React.FC = () => {
  const { user, profile } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile) {
      fetchOnlineUsers()
      
      // Mettre à jour le statut en ligne de l'utilisateur actuel
      updateOnlineStatus(true)
      
      // Actualiser la liste toutes les 30 secondes
      const interval = setInterval(fetchOnlineUsers, 30000)
      
      // Nettoyer au démontage
      return () => {
        clearInterval(interval)
        updateOnlineStatus(false)
      }
    }
  }, [user, profile])

  const fetchOnlineUsers = async () => {
    if (!user || !profile) return

    try {
      setLoading(true)
      
      // Récupérer les utilisateurs en ligne (connectés dans les 5 dernières minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_online', true)
        .gte('last_seen', fiveMinutesAgo)

      // Filtrer selon les préférences de l'utilisateur
      if (profile.looking_for !== 'both') {
        query = query.eq('gender', profile.looking_for)
      }

      const { data, error } = await query
        .order('last_seen', { ascending: false })
        .limit(20)

      if (error) throw error
      setOnlineUsers(data || [])
    } catch (error) {
      console.error('Error fetching online users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return

    try {
      await supabase
        .from('profiles')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id)
    } catch (error) {
      console.error('Error updating online status:', error)
    }
  }

  const handleLike = async (profileId: string) => {
    if (!user) return

    try {
      await supabase
        .from('likes')
        .insert({ user_id: user.id, liked_user_id: profileId })
    } catch (error) {
      console.error('Error liking profile:', error)
    }
  }

  const handleMessage = (profileId: string) => {
    // Rediriger vers la page de messages avec ce profil
    window.location.href = `/messages?user=${profileId}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            En ligne maintenant
          </h2>
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
            {onlineUsers.length} connecté{onlineUsers.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {onlineUsers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-shrink-0">
                    {onlineUser.photos && onlineUser.photos.length > 0 ? (
                      <img
                        src={onlineUser.photos[0]}
                        alt={onlineUser.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {onlineUser.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Indicateur en ligne */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Circle className="h-2 w-2 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {onlineUser.full_name}
                      </h3>
                      {onlineUser.is_premium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                          Premium
                        </span>
                      )}
                      {onlineUser.is_verified && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          Vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {onlineUser.age} ans • {onlineUser.location}
                    </p>
                    {onlineUser.bio && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {onlineUser.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMessage(onlineUser.id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title="Envoyer un message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleLike(onlineUser.id)}
                      className="p-2 bg-violet-100 text-violet-600 rounded-full hover:bg-violet-200 transition-colors"
                      title="Liker"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucun utilisateur en ligne
            </h3>
            <p className="text-gray-500">
              Revenez plus tard pour voir qui est connecté
            </p>
          </div>
        )}
      </div>

      {onlineUsers.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={fetchOnlineUsers}
            className="w-full text-center text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            Actualiser la liste
          </button>
        </div>
      )}
    </div>
  )
}

export default OnlineUsers