import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMessages } from '../contexts/MessagesContext'
import { useLikes } from '../hooks/useLikes'
import { supabase } from '../lib/supabase'
import { Profile } from '../types/supabase'
import { MessageCircle, Heart } from 'lucide-react'

const OnlineUsers: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { setSelectedConversation } = useMessages()
  const { handleLike } = useLikes()
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile) {
      fetchOnlineUsers()
      const interval = setInterval(fetchOnlineUsers, 30000) // Rafraîchir toutes les 30 secondes
      return () => clearInterval(interval)
    }
  }, [user, profile])

  const fetchOnlineUsers = async () => {
    if (!user || !profile) return

    try {
      setLoading(true)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_online', true)
        .gte('last_seen', fiveMinutesAgo)

      // Filtrer par genre selon les préférences
      if (profile.looking_for !== 'both') {
        query = query.eq('gender', profile.looking_for)
      }

      const { data, error } = await query
        .order('last_seen', { ascending: false })
        .limit(20)

      if (error) throw error
      setOnlineUsers(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs en ligne:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = (profileId: string) => {
    const conversation = {
      id: `${user?.id}-${profileId}`,
      participants: [user?.id || '', profileId],
      created_at: new Date().toISOString()
    }
    setSelectedConversation(conversation)
    navigate(`/messages?user=${profileId}`)
  }

  const handleLikeClick = async (profileId: string) => {
    const { isMatch } = await handleLike(profileId, false)
    if (isMatch) {
      alert('🎉 C\'est un match ! Vous pouvez maintenant vous envoyer des messages.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (onlineUsers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600">Aucun utilisateur en ligne pour le moment</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Utilisateurs en ligne</h2>
      <div className="space-y-6">
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={user.avatar_url || '/default-avatar.png'}
                alt={`${user.first_name}'s avatar`}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {user.first_name}, {user.age}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLikeClick(user.id)}
                    className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
                    title="J'aime"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleMessage(user.id)}
                    className="p-2 text-violet-500 hover:bg-violet-50 rounded-full transition-colors"
                    title="Envoyer un message"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{user.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OnlineUsers