import React, { useState } from 'react'
import { Heart, X, MapPin, MessageCircle, Zap } from 'lucide-react'
import { Profile } from '../../lib/supabase'

interface ProfileCardProps {
  profile: Profile
  onLike?: (profileId: string, isSuperLike?: boolean) => void
  onPass?: (profileId: string) => void
  onMessage?: (profileId: string) => void
  showActions?: boolean
  loading?: boolean
  superLikesLeft?: number
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onPass,
  onMessage,
  showActions = true,
  loading = false,
  superLikesLeft = 0,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

<<<<<<< HEAD
  const handlePhotoChange = (index: number) => {
    setCurrentPhotoIndex(index)
  }

=======
>>>>>>> 89e2284cddfc1c11142e3570b40a910cf8916afc
  const handleLike = (isSuperLike = false) => {
    if (onLike) onLike(profile.id, isSuperLike)
  }

  const handlePass = () => {
    if (onPass) onPass(profile.id)
  }

  const handleMessage = () => {
    if (onMessage) onMessage(profile.id)
  }

  const handlePhotoChange = (index: number) => {
    setCurrentPhotoIndex(index)
  }

  return (
<<<<<<< HEAD
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
      {/* Photo Section */}
      <div className="relative">
        <div className="h-60 bg-gradient-to-br from-violet-100 to-orange-100 flex items-center justify-center">
          {profile.photos && profile.photos.length > 0 ? (
            <img
              src={profile.photos[currentPhotoIndex]}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p>Aucune photo</p>
            </div>
          )}
        </div>

        {/* Photo indicators */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex space-x-1">
            {profile.photos.map((_, index) => (
              <button
                key={index}
                onClick={() => handlePhotoChange(index)}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
=======
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full transition hover:shadow-xl hover:scale-105 duration-200 relative">
      {/* Photo */}
      <div className="h-64 w-full bg-gray-100 relative">
        {profile.photos?.length > 0 ? (
          <img
            src={profile.photos[currentPhotoIndex]}
            alt={profile.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Indicators */}
        {profile.photos?.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {profile.photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePhotoChange(idx)}
                className={`w-2 h-2 rounded-full ${
                  idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
>>>>>>> 89e2284cddfc1c11142e3570b40a910cf8916afc
                }`}
              />
            ))}
          </div>
        )}

<<<<<<< HEAD
        {/* Online status */}
        {profile.is_online && (
          <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile.full_name}</h3>
            <p className="text-gray-600">{profile.age} ans</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-gray-500 mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{profile.location}</span>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          {profile.occupation && (
            <div className="flex items-center text-gray-600">
              <Briefcase className="h-4 w-4 mr-2" />
              <span className="text-sm">{profile.occupation}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center text-gray-600">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span className="text-sm">{profile.education}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-4">
            <p className="text-gray-700 text-sm line-clamp-3">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{profile.interests.length - 3} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-4 mt-6">
            <div className="flex space-x-4">
              <button
                onClick={handlePass}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-600 p-3 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleMessage}
                disabled={loading}
                className="flex-1 bg-blue-100 text-blue-600 p-3 rounded-full hover:bg-blue-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleLike(false)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-violet-500 to-orange-500 text-white p-3 rounded-full hover:from-violet-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {/* Super Like Button */}
            <button
              onClick={() => handleLike(true)}
              disabled={loading || superLikesLeft <= 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="text-sm">Super Like</span>
                  <span className="text-xs">({superLikesLeft} restants)</span>
                </>
              )}
=======
        {/* Online badge */}
        {profile.is_online && (
          <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </div>

      {/* Infos */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {profile.full_name}, {profile.age}
            </h3>
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {profile.location}
            </span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Intérêts */}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.interests.slice(0, 3).map((int, i) => (
                <span
                  key={i}
                  className="text-xs bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full"
                >
                  {int}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  +{profile.interests.length - 3} autres
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={handlePass}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-gray-500 rounded-full mx-auto" />
                ) : (
                  <X className="h-4 w-4 mx-auto" />
                )}
              </button>

              <button
                onClick={handleMessage}
                disabled={loading}
                className="flex-1 bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4 mx-auto" />
              </button>

              <button
                onClick={() => handleLike(false)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-violet-500 to-orange-500 text-white p-2 rounded-full hover:scale-105 transition disabled:opacity-50"
              >
                <Heart className="h-4 w-4 mx-auto" />
              </button>
            </div>

            {/* Super Like */}
            <button
              onClick={() => handleLike(true)}
              disabled={loading || superLikesLeft <= 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full flex items-center justify-center space-x-2 hover:scale-105 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Super Like</span>
              <span className="text-xs">({superLikesLeft})</span>
>>>>>>> 89e2284cddfc1c11142e3570b40a910cf8916afc
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileCard
