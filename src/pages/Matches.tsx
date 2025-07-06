import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ProfileCard from '../components/Profile/ProfileCard'
import { Heart, MessageCircle, Users, X } from 'lucide-react'

interface MatchWithProfile {
  id: string
  matched_user_id: string
  status: string
  created_at: string
  profile: Profile
}

const Matches: React.FC = () => {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null)

  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user])

  const fetchMatches = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_matched_user_id_fkey (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'mutual')
        .order('created_at', { ascending: false })

      if (error) throw error

      const matchesWithProfiles = (data || []).map(match => ({
        ...match,
        profile: match.profiles
      })).filter(match => match.profile) // Filter out matches without profiles

      setMatches(matchesWithProfiles)
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = (profileId: string) => {
    // Navigate to messages with this profile
    window.location.href = `/messages?user=${profileId}`
  }

  const handleViewProfile = (match: MatchWithProfile) => {
    setSelectedMatch(match)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Matches</h1>
          <p className="text-gray-600">
            Vous avez {matches.length} match{matches.length > 1 ? 's' : ''} mutuel{matches.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Matches Grid */}
        {matches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleViewProfile(match)}
              >
                <div className="h-64 bg-gradient-to-br from-violet-100 to-orange-100 flex items-center justify-center relative">
                  {match.profile.photos && match.profile.photos.length > 0 ? (
                    <img
                      src={match.profile.photos[0]}
                      alt={match.profile.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-gray-400 text-center">
                              <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span class="text-xl font-bold text-gray-400">
                                  ${match.profile.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <p>Photo non disponible</p>
                            </div>
                          `
                        }
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-400">
                          {match.profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p>Aucune photo</p>
                    </div>
                  )}
                  
                  {/* Online status */}
                  {match.profile.is_online && (
                    <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{match.profile.full_name}</h3>
                      <p className="text-gray-600">{match.profile.age} ans • {match.profile.location}</p>
                    </div>
                    <div className="flex items-center text-violet-500">
                      <Heart className="h-5 w-5 fill-current" />
                    </div>
                  </div>

                  {match.profile.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {match.profile.bio}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMessage(match.profile.id)
                      }}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              Aucun match pour le moment
            </h3>
            <p className="text-gray-500 mb-6">
              Continuez à liker des profils pour obtenir des matches !
            </p>
            <button
              onClick={() => window.location.href = '/discover'}
              className="bg-gradient-to-r from-violet-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all"
            >
              Découvrir des profils
            </button>
          </div>
        )}

        {/* Profile Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Profil complet</h2>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <ProfileCard
                  profile={selectedMatch.profile}
                  onMessage={handleMessage}
                  showActions={false}
                />
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleMessage(selectedMatch.profile.id)}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-orange-500 text-white py-3 px-4 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Envoyer un message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Matches