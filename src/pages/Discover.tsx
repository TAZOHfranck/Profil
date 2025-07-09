import React, { useState, useEffect, useCallback } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProfileCard from '../components/Profile/ProfileCard'
import AdvancedSearch from '../components/Search/AdvancedSearch'
import OnlineUsers from '../components/Online/OnlineUsers'
import ProfileCompletionBanner from '../components/Profile/ProfileCompletionBanner'
import { Filter, Heart, X, Crown, Zap } from 'lucide-react'
import { useMessages } from '../contexts/MessagesContext'
import { useLikes } from '../hooks/useLikes'
import { useInView } from 'react-intersection-observer'

interface SearchFilters {
  minAge: number
  maxAge: number
  location: string
  maxDistance: number
  education: string
  occupation: string
  interests: string[]
  bodyType: string
  height: { min: number; max: number }
  smoking: string
  drinking: string
  hasChildren: string
  wantsChildren: string
  religion: string
  ethnicity: string
  languages: string[]
  onlineOnly: boolean
  hasPhotos: boolean
  verifiedOnly: boolean
  premiumOnly: boolean
}

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
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true
  })

  const [filters, setFilters] = useState<SearchFilters>({
    minAge: 18,
    maxAge: 80,
    location: '',
    maxDistance: 50,
    education: '',
    occupation: '',
    interests: [],
    bodyType: '',
    height: { min: 140, max: 220 },
    smoking: '',
    drinking: '',
    hasChildren: '',
    wantsChildren: '',
    religion: '',
    ethnicity: '',
    languages: [],
    onlineOnly: false,
    hasPhotos: false,
    verifiedOnly: false,
    premiumOnly: false
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

      // Apply all filters
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
      if (isMatch) {
        // Show match notification using a proper notification system
        alert('🎉 C\'est un match ! Vous pouvez maintenant vous envoyer des messages.')
      }
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
      setSelectedConversation({
        profile: profileToMessage,
        lastMessage: null,
        unreadCount: 0
      })
      navigate(`/messages?user=${profileId}`)
    }
  }, [profiles, setSelectedConversation, navigate])

  const resetFilters = () => {
    setFilters({
      minAge: 18,
      maxAge: 65,
      location: '',
      maxDistance: 50,
      education: '',
      occupation: '',
      interests: [],
      bodyType: '',
      height: { min: 140, max: 220 },
      smoking: '',
      drinking: '',
      hasChildren: '',
      wantsChildren: '',
      religion: '',
      ethnicity: '',
      languages: [],
      onlineOnly: false,
      hasPhotos: false,
      verifiedOnly: false,
      premiumOnly: false
    })
  }

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des profils...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {showCompletionBanner && (
          <ProfileCompletionBanner onDismiss={() => setShowCompletionBanner(false)} />
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Découvrir</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="hidden sm:inline">En ligne</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {showOnlineUsers && <OnlineUsers />}
            
            {profile && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Super Likes</h3>
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    {superLikesLeft}
                  </div>
                  <p className="text-sm text-gray-600">
                    {profile.is_premium ? 'restants aujourd\'hui' : 'gratuit par jour'}
                  </p>
                  {!profile.is_premium && (
                    <p className="text-xs text-gray-500 mt-2">
                      Premium : 5 Super Likes/jour
                    </p>
                  )}
                </div>
              </div>
            )}

            {!profile?.is_premium && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Crown className="h-6 w-6 mr-2" />
                  <h3 className="text-lg font-bold">Passez à Premium</h3>
                </div>
                <p className="text-sm mb-4">
                  Débloquez toutes les fonctionnalités et apparaissez en priorité !
                </p>
                <button className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Découvrir Premium
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            {showFilters && (
              <AdvancedSearch
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={() => fetchProfiles(0)}
                onReset={resetFilters}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.length > 0 ? (
                profiles.map((profile, index) => (
                  <div 
                    key={profile.id} 
                    className="relative transform hover:scale-105 transition-transform duration-200"
                    ref={index === profiles.length - 1 ? ref : undefined}
                  >
                    <ProfileCard
                      profile={profile}
                      onLike={handleLike}
                      onPass={handlePass}
                      onMessage={handleMessage}
                      showActions={true}
                      loading={likeLoading}
                      superLikesLeft={superLikesLeft}
                    />
                    
                    {profile.is_premium && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 z-10">
                        <Crown className="h-4 w-4" />
                        <span>Premium</span>
                      </div>
                    )}

                    {profile.is_verified && (
                      <div className="absolute -top-2 -left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                        ✓ Vérifié
                      </div>
                    )}

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                      {/* <button
                        onClick={() => handlePass(profile.id)}
                        disabled={likeLoading}
                        className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-5 w-5" />
                      </button> */}
                      
                      {/* <button
                        onClick={() => handleLike(profile.id, true)}
                        disabled={likeLoading || superLikesLeft <= 0}
                        className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="h-5 w-5" />
                      </button> */}

                      {/* <button
                        onClick={() => handleLike(profile.id, false)}
                        disabled={likeLoading}
                        className="w-10 h-10 bg-gradient-to-r from-violet-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:from-violet-600 hover:to-orange-600 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Heart className="h-5 w-5" />
                      </button> */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    Aucun profil disponible
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Ajustez vos filtres pour voir plus de profils
                  </p>
                  <button
                    onClick={() => fetchProfiles(0)}
                    className="bg-gradient-to-r from-violet-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all"
                  >
                    Actualiser
                  </button>
                </div>
              )}
            </div>

            {loading && profiles.length > 0 && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Discover