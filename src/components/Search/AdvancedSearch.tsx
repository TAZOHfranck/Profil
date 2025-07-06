import React, { useState } from 'react'
import { Search, Filter, X, MapPin, Calendar, Briefcase, Heart } from 'lucide-react'

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

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  onReset: () => void
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleInterest = (interest: string) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest]
    updateFilter('interests', newInterests)
  }

  const toggleLanguage = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter(l => l !== language)
      : [...filters.languages, language]
    updateFilter('languages', newLanguages)
  }

  const commonInterests = [
    'Voyage', 'Sport', 'Musique', 'Cinéma', 'Lecture', 'Cuisine', 'Danse', 'Art',
    'Nature', 'Photographie', 'Fitness', 'Mode', 'Technologie', 'Yoga', 'Randonnée'
  ]

  const languages = [
    'Français', 'Anglais', 'Espagnol', 'Arabe', 'Portugais', 'Italien', 'Allemand',
    'Wolof', 'Bambara', 'Lingala', 'Swahili', 'Amharique'
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Recherche avancée
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-violet-500 hover:text-violet-600 flex items-center space-x-1"
        >
          <Filter className="h-4 w-4" />
          <span>{showAdvanced ? 'Masquer' : 'Plus de filtres'}</span>
        </button>
      </div>

      {/* Basic Filters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Âge minimum
          </label>
          <input
            type="number"
            min="18"
            max="100"
            value={filters.minAge}
            onChange={(e) => updateFilter('minAge', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Âge maximum
          </label>
          <input
            type="number"
            min="18"
            max="100"
            value={filters.maxAge}
            onChange={(e) => updateFilter('maxAge', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Ville ou région..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => updateFilter('onlineOnly', !filters.onlineOnly)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.onlineOnly
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          En ligne maintenant
        </button>
        <button
          onClick={() => updateFilter('hasPhotos', !filters.hasPhotos)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.hasPhotos
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Avec photos
        </button>
        <button
          onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.verifiedOnly
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Profils vérifiés
        </button>
        <button
          onClick={() => updateFilter('premiumOnly', !filters.premiumOnly)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.premiumOnly
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Membres Premium
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 border-t pt-6">
          {/* Physical Attributes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Apparence physique</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de corps
                </label>
                <select
                  value={filters.bodyType}
                  onChange={(e) => updateFilter('bodyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Tous</option>
                  <option value="slim">Mince</option>
                  <option value="athletic">Athlétique</option>
                  <option value="average">Moyen</option>
                  <option value="curvy">Pulpeux</option>
                  <option value="large">Corpulent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille (cm)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="140"
                    max="220"
                    value={filters.height.min}
                    onChange={(e) => updateFilter('height', { ...filters.height, min: parseInt(e.target.value) })}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="number"
                    min="140"
                    max="220"
                    value={filters.height.max}
                    onChange={(e) => updateFilter('height', { ...filters.height, max: parseInt(e.target.value) })}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Style de vie</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tabac
                </label>
                <select
                  value={filters.smoking}
                  onChange={(e) => updateFilter('smoking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Peu importe</option>
                  <option value="never">Jamais</option>
                  <option value="occasionally">Occasionnellement</option>
                  <option value="regularly">Régulièrement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcool
                </label>
                <select
                  value={filters.drinking}
                  onChange={(e) => updateFilter('drinking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Peu importe</option>
                  <option value="never">Jamais</option>
                  <option value="occasionally">Occasionnellement</option>
                  <option value="regularly">Régulièrement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Family */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Famille</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  A des enfants
                </label>
                <select
                  value={filters.hasChildren}
                  onChange={(e) => updateFilter('hasChildren', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Peu importe</option>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veut des enfants
                </label>
                <select
                  value={filters.wantsChildren}
                  onChange={(e) => updateFilter('wantsChildren', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Peu importe</option>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Centres d'intérêt</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {commonInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.interests.includes(interest)
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Langues parlées</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {languages.map(language => (
                <button
                  key={language}
                  onClick={() => toggleLanguage(language)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.languages.includes(language)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={onSearch}
          className="flex-1 bg-gradient-to-r from-violet-500 to-orange-500 text-white py-3 px-6 rounded-lg hover:from-violet-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Rechercher</span>
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

export default AdvancedSearch