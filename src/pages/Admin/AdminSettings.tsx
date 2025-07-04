import React, { useState, useEffect } from 'react'
import { SystemSettings } from '../../types/admin'
import { Settings, Save, AlertCircle } from 'lucide-react'

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    app_name: 'AfrointroductionsHub',
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: false,
    max_photos_per_user: 6,
    premium_price_monthly: 29.99,
    premium_price_yearly: 199.99,
    super_likes_free: 1,
    super_likes_premium: 5,
    max_age: 100,
    min_age: 18,
    featured_users_limit: 10
  })
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Here you would save to your database or configuration system
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres Système</h1>
        <p className="text-gray-600">Configurez les paramètres globaux de l'application</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration Générale
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* App Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Application</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'application
                </label>
                <input
                  type="text"
                  value={settings.app_name}
                  onChange={(e) => updateSetting('app_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite d'utilisateurs en vedette
                </label>
                <input
                  type="number"
                  value={settings.featured_users_limit}
                  onChange={(e) => updateSetting('featured_users_limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Utilisateurs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge minimum
                </label>
                <input
                  type="number"
                  value={settings.min_age}
                  onChange={(e) => updateSetting('min_age', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge maximum
                </label>
                <input
                  type="number"
                  value={settings.max_age}
                  onChange={(e) => updateSetting('max_age', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos maximum par utilisateur
                </label>
                <input
                  type="number"
                  value={settings.max_photos_per_user}
                  onChange={(e) => updateSetting('max_photos_per_user', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Premium Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Premium</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix mensuel (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.premium_price_monthly}
                  onChange={(e) => updateSetting('premium_price_monthly', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix annuel (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.premium_price_yearly}
                  onChange={(e) => updateSetting('premium_price_yearly', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Super Likes gratuits par jour
                </label>
                <input
                  type="number"
                  value={settings.super_likes_free}
                  onChange={(e) => updateSetting('super_likes_free', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Super Likes Premium par jour
                </label>
                <input
                  type="number"
                  value={settings.super_likes_premium}
                  onChange={(e) => updateSetting('super_likes_premium', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Fonctionnalités</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Mode maintenance</h4>
                  <p className="text-sm text-gray-500">Désactive l'accès au site pour les utilisateurs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Inscription activée</h4>
                  <p className="text-sm text-gray-500">Permet aux nouveaux utilisateurs de s'inscrire</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.registration_enabled}
                    onChange={(e) => updateSetting('registration_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Vérification email requise</h4>
                  <p className="text-sm text-gray-500">Oblige les utilisateurs à vérifier leur email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_verification_required}
                    onChange={(e) => updateSetting('email_verification_required', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Warning for maintenance mode */}
          {settings.maintenance_mode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Mode maintenance activé
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Le site est actuellement inaccessible aux utilisateurs. Seuls les administrateurs peuvent y accéder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>

          {/* Save confirmation */}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Paramètres sauvegardés avec succès !
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings