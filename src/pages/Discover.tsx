import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProfileCard from '../components/Profile/ProfileCard'
import AdvancedSearch from '../components/Search/AdvancedSearch'
import OnlineUsers from '../components/Online/OnlineUsers'
import ProfileCompletionBanner from '../components/Profile/ProfileCompletionBanner'
import { Filter, Heart, X, Crown, Zap, Shield, Target } from 'lucide-react'
import { useMessages } from '../contexts/MessagesContext'
import { useLikes } from '../hooks/useLikes'
import CompatibilityTest from '../components/Compatibility/CompatibilityTest'
import VerificationCenter from '../components/Verification/VerificationCenter'

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

// ... début du fichier inchangé jusqu'à la définition du composant Discover

const Discover: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { setSelectedConversation } = useMessages()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showOnlineUsers, setShowOnlineUsers] = useState(false)
  const [showCompletionBanner, setShowCompletionBanner] = useState(true)
  const { superLikesLeft, handleLike: handleLikeAction, handlePass: handlePassAction, loading: likeLoading, error: likeError } = useLikes()
  const [filters, setFilters] = useState<SearchFilters>({
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

  useEffect(() => {
    if (user && profile) {
      fetchProfiles()
    }
  }, [user, profile])



  const fetchProfiles = async () => {
    if (!user || !profile) return

    try {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .gte('age', filters.minAge)
        .lte('age', filters.maxAge)
        .eq('is_active', true)

      // Filtrer par genre selon les préférences
      if (profile.looking_for !== 'both') {
        query = query.eq('gender', profile.looking_for)
      }

      // Appliquer les filtres avancés
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters.onlineOnly) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        query = query.eq('is_online', true).gte('last_seen', fiveMinutesAgo)
      }

      if (filters.hasPhotos) {
        query = query.not('photos', 'is', null).neq('photos', '{}')
      }

      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true)
      }

      if (filters.premiumOnly) {
        query = query.eq('is_premium', true)
      }

      if (filters.smoking) {
        query = query.eq('smoking', filters.smoking)
      }

      if (filters.drinking) {
        query = query.eq('drinking', filters.drinking)
      }

      if (filters.bodyType) {
        query = query.eq('body_type', filters.bodyType)
      }

      if (filters.education) {
        query = query.ilike('education', `%${filters.education}%`)
      }

      if (filters.occupation) {
        query = query.ilike('occupation', `%${filters.occupation}%`)
      }

      // Trier par priorité Premium d'abord, puis par dernière activité
      const { data, error } = await query
        .order('is_premium', { ascending: false })
        .order('last_seen', { ascending: false })
        .limit(50)

      if (error) throw error

      // Filtrer les profils déjà likés/passés
      const likedProfiles = await getLikedProfiles()
      let filteredProfiles = (data || []).filter(p => !likedProfiles.includes(p.id))

      // Filtrer par centres d'intérêt
      if (filters.interests.length > 0) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.interests && p.interests.some(interest => filters.interests.includes(interest))
        )
      }

      // Filtrer par langues
      if (filters.languages.length > 0) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.languages && p.languages.some(lang => filters.languages.includes(lang))
        )
      }

      // Filtrer par taille
      if (filters.height.min > 140 || filters.height.max < 220) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.height >= filters.height.min && p.height <= filters.height.max
        )
      }

      // Filtrer par enfants
      if (filters.hasChildren) {
        const hasChildren = filters.hasChildren === 'yes'
        filteredProfiles = filteredProfiles.filter(p => p.has_children === hasChildren)
      }

      if (filters.wantsChildren) {
        const wantsChildren = filters.wantsChildren === 'yes'
        filteredProfiles = filteredProfiles.filter(p => p.wants_children === wantsChildren)
      }

      setProfiles(filteredProfiles)
      setCurrentProfileIndex(0)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

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
    const { isMatch } = await handleLikeAction(profileId, isSuperLike)
    if (isMatch) {
      alert('🎉 C\'est un match ! Vous pouvez maintenant vous envoyer des messages.')
    }
    nextProfile()
  }

  const handlePass = async (profileId: string) => {
    await handlePassAction(profileId)
    nextProfile()
  }

  const nextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1)
    } else {
      // Recharger plus de profils
      fetchProfiles()
    }
  }

  const handleMessage = (profileId: string) => {
    // Rediriger vers la page des messages et sélectionner la conversation avec l'utilisateur
    const conversation = {
      profile: profiles[currentProfileIndex],
      lastMessage: null,
      unreadCount: 0
    }
    setSelectedConversation(conversation)
    navigate(`/messages?user=${profileId}`)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des profils...</p>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentProfileIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Completion Banner */}
        {showCompletionBanner && (
          <ProfileCompletionBanner onDismiss={() => setShowCompletionBanner(false)} />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Découvrir</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>En ligne</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Online Users */}
            {showOnlineUsers && <OnlineUsers />}
            
            {/* Super Likes Counter */}
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
            
            {/* Compatibility Test */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Test de Compatibilité</h3>
                <Target className="h-6 w-6 text-violet-500" />
              </div>
              <CompatibilityTest />
            </div>

            {/* Verification Center */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Centre de Vérification</h3>
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <VerificationCenter />
            </div>

            {/* Premium Upgrade */}
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

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters Panel */}
            {showFilters && (
              <AdvancedSearch
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={fetchProfiles}
                onReset={resetFilters}
              />
            )}

            {/* Profile Display */}
            <div className="flex justify-center">
              {currentProfile ? (
                <div className="relative">
                  <ProfileCard
                    profile={currentProfile}
                    onLike={handleLike}
                    onPass={handlePass}
                    onMessage={handleMessage}
                    showActions={true}
                    loading={likeLoading}
                    superLikesLeft={superLikesLeft}
                  />
                  
                  {/* Premium Badge */}
                  {currentProfile.is_premium && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <Crown className="h-4 w-4" />
                      <span>Premium</span>
                    </div>
                  )}

                  {/* Verified Badge */}
                  {currentProfile.is_verified && (
                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ✓ Vérifié
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    Aucun profil disponible
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Ajustez vos filtres pour voir plus de profils
                  </p>
                  <button
                    onClick={fetchProfiles}
                    className="bg-gradient-to-r from-violet-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all"
                  >
                    Actualiser
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {currentProfile && (
              <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
                <button
                  onClick={() => handlePass(currentProfile.id)}
                  disabled={likeLoading}
                  className="w-14 h-14 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {likeLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                </button>
                
                {/* Super Like Button */}
                <button
                  onClick={() => handleLike(currentProfile.id, true)}
                  disabled={likeLoading || superLikesLeft <= 0}
                  className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {likeLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <Zap className="h-6 w-6" />
                  )}
                </button>

                <button
                  onClick={() => handleLike(currentProfile.id, false)}
                  disabled={likeLoading}
                  className="w-14 h-14 bg-gradient-to-r from-violet-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:from-violet-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {likeLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <Heart className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Discover