import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Shield, Camera, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const VerificationCenter: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(profile?.verification_status || 'none')

  const handlePhotoVerification = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `verification/${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('verification')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('verification')
        .getPublicUrl(fileName)

      // Créer une demande de vérification
      await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          type: 'photo',
          data: { photo_url: publicUrl },
          status: 'pending'
        })

      await updateProfile({ verification_status: 'pending' })
      setVerificationStatus('pending')
    } catch (error) {
      console.error('Error uploading verification photo:', error)
    } finally {
      setUploading(false)
    }
  }

  const handlePhoneVerification = async (phoneNumber: string) => {
    try {
      // Ici vous intégreriez un service SMS comme Twilio
      await supabase
        .from('verification_requests')
        .insert({
          user_id: user?.id,
          type: 'phone',
          data: { phone_number: phoneNumber },
          status: 'pending'
        })

      await updateProfile({ verification_status: 'pending' })
      setVerificationStatus('pending')
    } catch (error) {
      console.error('Error requesting phone verification:', error)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500" />
      case 'rejected':
        return <AlertCircle className="h-8 w-8 text-red-500" />
      default:
        return <Shield className="h-8 w-8 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Profil vérifié'
      case 'pending':
        return 'Vérification en cours'
      case 'rejected':
        return 'Vérification refusée'
      default:
        return 'Non vérifié'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        {getStatusIcon()}
        <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">
          Vérification du profil
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {getStatusText()}
        </p>
        <p className="text-gray-500">
          La vérification augmente votre crédibilité et vos chances de matches
        </p>
      </div>

      {verificationStatus === 'none' && (
        <div className="space-y-6">
          {/* Photo Verification */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Camera className="h-6 w-6 mr-2" />
              Vérification par photo
            </h2>
            <p className="text-gray-600 mb-4">
              Prenez une photo de vous tenant une pièce d'identité pour vérifier votre identité
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Téléchargez une photo claire de vous avec votre pièce d'identité
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoVerification}
                className="hidden"
                id="verification-photo"
              />
              <label
                htmlFor="verification-photo"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                {uploading ? 'Upload...' : 'Choisir une photo'}
              </label>
            </div>
          </div>

          {/* Phone Verification */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Vérification par téléphone
            </h2>
            <p className="text-gray-600 mb-4">
              Vérifiez votre numéro de téléphone pour plus de sécurité
            </p>
            <div className="flex space-x-2">
              <input
                type="tel"
                placeholder="+33 6 12 34 56 78"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handlePhoneVerification('+33612345678')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Vérifier
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Vérification en cours
          </h3>
          <p className="text-yellow-700">
            Votre demande de vérification est en cours de traitement. 
            Vous recevrez une notification sous 24-48h.
          </p>
        </div>
      )}

      {verificationStatus === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Profil vérifié !
          </h3>
          <p className="text-green-700">
            Félicitations ! Votre profil est maintenant vérifié. 
            Vous apparaîtrez avec un badge de vérification.
          </p>
        </div>
      )}
    </div>
  )
}

export default VerificationCenter