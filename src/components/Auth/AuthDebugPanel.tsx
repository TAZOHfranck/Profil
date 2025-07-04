import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Settings, User, Database, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const AuthDebugPanel: React.FC = () => {
  const { user, profile } = useAuth()
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null)
  const [authProviders, setAuthProviders] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    checkSupabaseConfig()
  }, [])

  const checkSupabaseConfig = async () => {
    try {
      // Vérifier la configuration Supabase
      const config = {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant',
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      }
      setSupabaseConfig(config)

      // Tester la connexion à Supabase
      try {
        const { data, error } = await supabase.auth.getSession()
        setAuthProviders({
          sessionCheck: error ? '❌ Erreur' : '✅ OK',
          currentSession: data.session ? '✅ Session active' : '⚠️ Pas de session'
        })
      } catch (error) {
        setAuthProviders({
          sessionCheck: '❌ Erreur de connexion',
          error: error
        })
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la configuration:', error)
    }
  }

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 Test de l\'authentification Google...')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/discover`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) {
        console.error('❌ Erreur test Google:', error)
        alert(`Erreur Google Auth: ${error.message}`)
      } else {
        console.log('✅ Test Google réussi - redirection en cours...')
      }
    } catch (error) {
      console.error('❌ Erreur lors du test:', error)
      alert(`Erreur: ${error}`)
    }
  }

  const createTestProfile = async () => {
    if (!user) {
      alert('Aucun utilisateur connecté')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || 'test@example.com',
          full_name: user.user_metadata?.full_name || 'Utilisateur Test',
          age: 25,
          location: 'Paris, France',
          gender: 'female',
          looking_for: 'male',
          bio: 'Profil créé automatiquement pour les tests',
          interests: ['test', 'debug'],
          photos: [],
          is_online: true,
          last_seen: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Erreur création profil:', error)
        alert(`Erreur: ${error.message}`)
      } else {
        console.log('✅ Profil test créé')
        alert('Profil test créé avec succès!')
        window.location.reload()
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      alert(`Erreur: ${error}`)
    }
  }

  // Ne pas afficher en production
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Auth"
      >
        <Settings className="h-5 w-5" />
      </button>

      {showDebug && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Debug Authentification
          </h3>

          {/* Configuration Supabase */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Configuration Supabase
            </h4>
            <div className="text-sm space-y-1">
              <div>URL: {supabaseConfig?.hasUrl ? '✅' : '❌'}</div>
              <div>Anon Key: {supabaseConfig?.hasKey ? '✅' : '❌'}</div>
              {authProviders && (
                <>
                  <div>Session: {authProviders.sessionCheck}</div>
                  <div>État: {authProviders.currentSession}</div>
                </>
              )}
            </div>
          </div>

          {/* État utilisateur */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              État Utilisateur
            </h4>
            <div className="text-sm space-y-1">
              <div>Connecté: {user ? '✅' : '❌'}</div>
              {user && (
                <>
                  <div>Email: {user.email}</div>
                  <div>ID: {user.id.substring(0, 8)}...</div>
                  <div>Provider: {user.app_metadata?.provider || 'email'}</div>
                </>
              )}
              <div>Profil: {profile ? '✅' : '❌'}</div>
              {profile && (
                <div>Nom: {profile.full_name}</div>
              )}
            </div>
          </div>

          {/* Actions de test */}
          <div className="space-y-2">
            <button
              onClick={testGoogleAuth}
              className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Tester Google Auth
            </button>
            
            {user && !profile && (
              <button
                onClick={createTestProfile}
                className="w-full bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Créer profil test
              </button>
            )}

            <button
              onClick={checkSupabaseConfig}
              className="w-full bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Recharger config
            </button>
          </div>

          {/* Logs récents */}
          <div className="mt-4 text-xs text-gray-500">
            Ouvrez la console pour voir les logs détaillés
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthDebugPanel