import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const GoogleAuthButton: React.FC<{ mode: 'signin' | 'signup' }> = ({ mode }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Tentative de connexion Google...')
      await signInWithGoogle()
      
      console.log('✅ Connexion Google réussie')
      navigate('/discover')
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'authentification Google:', error)
      
      // Messages d'erreur plus explicites
      if (error.message?.includes('popup')) {
        setError('Popup bloquée. Veuillez autoriser les popups pour ce site.')
      } else if (error.message?.includes('network')) {
        setError('Problème de connexion. Vérifiez votre connexion internet.')
      } else if (error.message?.includes('cancelled')) {
        setError('Connexion annulée.')
      } else {
        setError('Erreur lors de la connexion avec Google. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500 mr-2"></div>
            Connexion en cours...
          </div>
        ) : (
          `${mode === 'signin' ? 'Se connecter' : 'S\'inscrire'} avec Google`
        )}
      </button>
      
      {error && (
        <div className="text-violet-600 text-sm text-center bg-violet-50 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

export default GoogleAuthButton