import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PhotoManager from '../components/Profile/PhotoManager'
import ActivityFeed from '../components/Activity/ActivityFeed'
import PremiumFeatures from '../components/Premium/PremiumFeatures'
import { Camera, Edit, MapPin, Calendar, Briefcase, GraduationCap, Heart, Users, MessageCircle, Settings, Crown, Star, Shield } from 'lucide-react'

const Profile: React.FC = () => {
  const { profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPremium, setShowPremium] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'photos' | 'activity' | 'premium'>('profile')
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    occupation: profile?.occupation || '',
    education: profile?.education || '',
    height: profile?.height || 0,
    body_type: profile?.body_type || '',
    smoking: profile?.smoking || 'never',
    drinking: profile?.drinking || 'never',
    religion: profile?.religion || '',
    ethnicity: profile?.ethnicity || '',
    relationship_status: profile?.relationship_status || 'single',
    has_children: profile?.has_children || false,
    wants_children: profile?.wants_children || false,
    interests: profile?.interests || [],
    languages: profile?.languages || []
  })

  const handleSave = async () => {
    try {
      await updateProfile(editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handlePhotosUpdate = async (photos: string[]) => {
    try {
      await updateProfile({ photos })
    } catch (error) {
      console.error('Error updating photos:', error)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleLanguageToggle = (language: string) => {
    setEditData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const handleUpgradeToPremium = () => {
    // Ici, vous intégreriez le système de paiement (Stripe, PayPal, etc.)
    console.log('Upgrade to premium')
  }

  const commonInterests = [
    'Voyage', 'Sport', 'Musique', 'Cinéma', 'Lecture', 'Cuisine', 'Danse', 'Art',
    'Nature', 'Photographie', 'Fitness', 'Mode', 'Technologie', 'Yoga', 'Randonnée'
  ]

  const languages = [
    'Français', 'Anglais', 'Espagnol', 'Arabe', 'Portugais', 'Italien', 'Allemand',
    'Wolof', 'Bambara', 'Lingala', 'Swahili', 'Amharique'
  ]

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-violet-500 to-orange-500">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {profile.photos && profile.photos.length > 0 ? (
                      <img
                        src={profile.photos[0]}
                        alt={profile.full_name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-violet-500">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {profile.is_premium && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white p-1 rounded-full">
                      <Crown className="h-4 w-4" />
                    </div>
                  )}
                  {profile.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                      <Shield className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold flex items-center space-x-2">
                    <span>{profile.full_name}</span>
                    {profile.is_premium && (
                      <Crown className="h-5 w-5 text-yellow-300" />
                    )}
                  </h1>
                  <p className="text-violet-100">{profile.age} ans • {profile.location}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {profile.is_online && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>En ligne</span>
                      </span>
                    )}
                    {profile.is_verified && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        Vérifié
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-violet-500 px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Heart className="h-8 w-8 text-violet-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">156</div>
            <div className="text-sm text-gray-600">Likes reçus</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">23</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">12</div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'profile', label: 'Profil', icon: Settings },
                { key: 'photos', label: 'Photos', icon: Camera },
                { key: 'activity', label: 'Activité', icon: Heart },
                { key: 'premium', label: 'Premium', icon: Crown }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de base</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.full_name}
                          onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <p className="text-gray-800">{profile.full_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData({...editData, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <MapPin className="h-4 w-4 mr-2" />
                          {profile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">À propos de moi</h3>
                  {isEditing ? (
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Parlez-nous de vous..."
                    />
                  ) : (
                    <p className="text-gray-800">{profile.bio || 'Aucune description disponible'}</p>
                  )}
                </div>

                {/* Professional Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations professionnelles</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.occupation}
                          onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {profile.occupation || 'Non spécifié'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Éducation</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.education}
                          onChange={(e) => setEditData({...editData, education: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <div className="flex items-center text-gray-800">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {profile.education || 'Non spécifié'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Physical Attributes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Apparence physique</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Taille (cm)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="140"
                          max="220"
                          value={editData.height}
                          onChange={(e) => setEditData({...editData, height: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <p className="text-gray-800">{profile.height ? `${profile.height} cm` : 'Non spécifié'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de corps</label>
                      {isEditing ? (
                        <select
                          value={editData.body_type}
                          onChange={(e) => setEditData({...editData, body_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">Non spécifié</option>
                          <option value="slim">Mince</option>
                          <option value="athletic">Athlétique</option>
                          <option value="average">Moyen</option>
                          <option value="curvy">Pulpeux</option>
                          <option value="large">Corpulent</option>
                        </select>
                      ) : (
                        <p className="text-gray-800">{profile.body_type || 'Non spécifié'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Style de vie</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tabac</label>
                      {isEditing ? (
                        <select
                          value={editData.smoking}
                          onChange={(e) => setEditData({...editData, smoking: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="never">Jamais</option>
                          <option value="occasionally">Occasionnellement</option>
                          <option value="regularly">Régulièrement</option>
                        </select>
                      ) : (
                        <p className="text-gray-800">
                          {profile.smoking === 'never' ? 'Jamais' : 
                           profile.smoking === 'occasionally' ? 'Occasionnellement' : 'Régulièrement'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alcool</label>
                      {isEditing ? (
                        <select
                          value={editData.drinking}
                          onChange={(e) => setEditData({...editData, drinking: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="never">Jamais</option>
                          <option value="occasionally">Occasionnellement</option>
                          <option value="regularly">Régulièrement</option>
                        </select>
                      ) : (
                        <p className="text-gray-800">
                          {profile.drinking === 'never' ? 'Jamais' : 
                           profile.drinking === 'occasionally' ? 'Occasionnellement' : 'Régulièrement'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Centres d'intérêt</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {commonInterests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            editData.interests.includes(interest)
                              ? 'bg-violet-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">Aucun centre d'intérêt ajouté</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Langues parlées</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {languages.map(language => (
                        <button
                          key={language}
                          onClick={() => handleLanguageToggle(language)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            editData.languages.includes(language)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.languages && profile.languages.length > 0 ? (
                        profile.languages.map((language, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {language}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">Aucune langue ajoutée</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gradient-to-r from-violet-500 to-orange-500 text-white rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <PhotoManager
                photos={profile.photos || []}
                onPhotosUpdate={handlePhotosUpdate}
              />
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && <ActivityFeed />}

            {/* Premium Tab */}
            {activeTab === 'premium' && (
              <PremiumFeatures onUpgrade={handleUpgradeToPremium} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile