// src/pages/discover.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProfileCard from '../components/Profile/ProfileCard'
import AdvancedSearch from '../components/Search/AdvancedSearch'
import OnlineUsers from '../components/Online/OnlineUsers'
import ProfileCompletionBanner from '../components/Profile/ProfileCompletionBanner'
import { Filter, Crown, Zap, Heart } from 'lucide-react'
import { useMessages } from '../contexts/MessagesContext'
import { useLikes } from '../hooks/useLikes'
import { useInView } from 'react-intersection-observer'

const PROFILES_PER_PAGE = 12

const Discover: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { setSelectedConversation } = useMessages()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showOnlineUsers, setShowOnlineUsers] = useState(false)
  const [showCompletionBanner, setShowCompletionBanner] = useState(true)
  const { superLikesLeft, handleLike: handleLikeAction, handlePass: handlePassAction, loading: likeLoading } = useLikes()
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })

  const [filters, setFilters] = useState<any>({
    minAge: 18, maxAge: 80, location: '', maxDistance: 50, education: '', occupation: '', interests: [],
    bodyType: '', height: { min: 140, max: 220 }, smoking: '', drinking: '', hasChildren: '', wantsChildren: '',
    religion: '', ethnicity: '', languages: [], onlineOnly: false, hasPhotos: false, verifiedOnly: false, premiumOnly: false
  })

  const fetchProfiles = useCallback(async (pageNumber: number = 0) => {
    if (!user || !profile) return
    try {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .neq('id', user.id)
        .range(pageNumber * PROFILES_PER_PAGE, (pageNumber + 1) * PROFILES_PER_PAGE - 1)
        .gte('age', filters.minAge)
        .lte('age', filters.maxAge)
        .eq('is_active', true)

      if (profile.looking_for !== 'both') {
        query = query.eq('gender', profile.looking_for)
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          query = query.ilike(key, `%${value}%`)
        } else if (Array.isArray(value) && value.length > 0) {
          query = query.contains(key, value)
        } else if (typeof value === 'boolean' && value) {
          query = query.eq(key, value)
        }
      })

      const { data, count, error } = await query
        .order('is_premium', { ascending: false })
        .order('last_seen', { ascending: false })

      if (error) throw error
      const likedProfiles = await getLikedProfiles()
      const newProfiles = (data || []).filter(p => !likedProfiles.includes(p.id))

      setProfiles(prev => pageNumber === 0 ? newProfiles : [...prev, ...newProfiles])
      setHasMore(count ? (pageNumber + 1) * PROFILES_PER_PAGE < count : false)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }, [user, profile, filters])

  useEffect(() => {
    if (user && profile) {
      setPage(0)
      fetchProfiles(0)
    }
  }, [user, profile, filters, fetchProfiles])

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => {
        const nextPage = prev + 1
        fetchProfiles(nextPage)
        return nextPage
      })
    }
  }, [inView, hasMore, loading, fetchProfiles])

  const getLikedProfiles = async () => {
    if (!user) return []
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('liked_user_id')
        .eq('user_id', user.id)
      if (error) throw error
      return (data || []).map(like => like.liked_user_id)
    } catch (error) {
      console.error('Error fetching liked profiles:', error)
      return []
    }
  }

  const handleLike = async (profileId: string, isSuperLike = false) => {
    try {
      const { isMatch } = await handleLikeAction(profileId, isSuperLike)
      if (isMatch) alert('🎉 C\'est un match !')
      setProfiles(prev => prev.filter(p => p.id !== profileId))
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handlePass = async (profileId: string) => {
    try {
      await handlePassAction(profileId)
      setProfiles(prev => prev.filter(p => p.id !== profileId))
    } catch (error) {
      console.error('Error handling pass:', error)
    }
  }

  const handleMessage = useCallback((profileId: string) => {
    const profileToMessage = profiles.find(p => p.id === profileId)
    if (profileToMessage) {
      setSelectedConversation({ profile: profileToMessage, lastMessage: null, unreadCount: 0 })
      navigate(`/messages?user=${profileId}`)
    }
  }, [profiles, setSelectedConversation, navigate])

  const resetFilters = () => {
    setFilters({
      minAge: 18, maxAge: 80, location: '', maxDistance: 50, education: '', occupation: '', interests: [],
      bodyType: '', height: { min: 140, max: 220 }, smoking: '', drinking: '', hasChildren: '', wantsChildren: '',
      religion: '', ethnicity: '', languages: [], onlineOnly: false, hasPhotos: false, verifiedOnly: false, premiumOnly: false
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        {showCompletionBanner && (
          <ProfileCompletionBanner onDismiss={() => setShowCompletionBanner(false)} />
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Découvrir</h1>
          <div className="flex space-x-4">
            <button onClick={() => setShowOnlineUsers(!showOnlineUsers)} className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="hidden sm:inline">En ligne</span>
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-lg">
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 space-y-6">
            {showOnlineUsers && <OnlineUsers />}
            {profile && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-bold text-gray-800 mb-2">Super Likes</h3>
                <div className="text-center text-2xl text-yellow-500">{superLikesLeft}</div>
              </div>
            )}
            {!profile?.is_premium && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white rounded-xl">
                <Crown className="h-6 w-6 mb-2" />
                <p className="font-bold">Passez Premium</p>
              </div>
            )}
          </div>

          <div className="lg:w-3/4 space-y-6">
            {showFilters && (
              <AdvancedSearch filters={filters} onFiltersChange={setFilters} onSearch={() => fetchProfiles(0)} onReset={resetFilters} />
            )}

            {/* Responsive Grid / Scrollable on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map((profile, index) => (
                <div
                  key={profile.id}
                  className="w-full max-w-xs mx-auto"
                  ref={index === profiles.length - 1 ? ref : undefined}
                >
                  <ProfileCard
                    profile={profile}
                    onLike={handleLike}
                    onPass={handlePass}
                    onMessage={handleMessage}
                    showActions
                    loading={likeLoading}
                    superLikesLeft={superLikesLeft}
                  />
                </div>
              ))}
            </div>

            {loading && <div className="text-center"><div className="animate-spin h-8 w-8 border-b-2 border-violet-500 rounded-full mx-auto" /></div>}
            {!loading && profiles.length === 0 && (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600">Aucun profil disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Discover
