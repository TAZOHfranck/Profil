import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, Camera, User, MapPin, Heart, Crown, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProfileCompletionBannerProps {
  onDismiss?: () => void
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ onDismiss }) => {
  const { profile } = useAuth()

  if (!profile) return null

  // Calculer le pourcentage de completion du profil
  const getProfileCompletion = () => {
    let completed = 0
    let total = 10

    if (profile.full_name) completed++
    if (profile.bio && profile.bio.length > 20) completed++
    if (profile.photos && profile.photos.length > 0) completed++
    if (profile.occupation) completed++
    if (profile.education) completed++
    if (profile.interests && profile.interests.length > 0) completed++
    if (profile.languages && profile.languages.length > 0) completed++
    if (profile.height && profile.height > 0) completed++
    if (profile.body_type) completed++
    if (profile.location) completed++

    return Math.round((completed / total) * 100)
  }

  const completionPercentage = getProfileCompletion()
  const isIncomplete = completionPercentage < 80

  // Suggestions d'amélioration
  const getSuggestions = () => {
    const suggestions = []
    
    if (!profile.photos || profile.photos.length === 0) {
      suggestions.push({ icon: Camera, text: 'Ajoutez des photos', priority: 'high' })
    }
    if (!profile.bio || profile.bio.length < 20) {
      suggestions.push({ icon: User, text: 'Complétez votre bio', priority: 'high' })
    }
    if (!profile.occupation) {
      suggestions.push({ icon: User, text: 'Ajoutez votre profession', priority: 'medium' })
    }
    if (!profile.interests || profile.interests.length === 0) {
      suggestions.push({ icon: Heart, text: 'Ajoutez vos centres d\'intérêt', priority: 'medium' })
    }
    if (!profile.height || profile.height === 0) {
      suggestions.push({ icon: User, text: 'Renseignez votre taille', priority: 'low' })
    }

    return suggestions.slice(0, 3) // Limiter à 3 suggestions
  }

  const suggestions = getSuggestions()

  if (!isIncomplete && profile.is_premium) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 relative">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {isIncomplete ? (
            <AlertCircle className="h-8 w-8 text-blue-500" />
          ) : (
            <Crown className="h-8 w-8 text-yellow-500" />
          )}
        </div>

        <div className="flex-1">
          {isIncomplete ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Complétez votre profil ({completionPercentage}%)
              </h3>
              <p className="text-gray-600 mb-4">
                Un profil complet augmente vos chances de trouver des matches de 5x !
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2 mb-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <suggestion.icon className="h-4 w-4 text-blue-500" />
                    <span>{suggestion.text}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {suggestion.priority === 'high' ? 'Important' :
                       suggestion.priority === 'medium' ? 'Recommandé' : 'Optionnel'}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                Compléter mon profil
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Passez à Premium pour plus de matches !
              </h3>
              <p className="text-gray-600 mb-4">
                Débloquez toutes les fonctionnalités et apparaissez en priorité dans les recherches.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span>Priorité dans les résultats</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Voir qui vous a liké</span>
                </div>
              </div>

              <Link
                to="/profile?tab=premium"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
              >
                <Crown className="h-4 w-4 mr-2" />
                Découvrir Premium
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletionBanner