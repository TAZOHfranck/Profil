import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Gift, Heart, Star, Crown, Coffee, Flower2, Diamond } from 'lucide-react'

interface VirtualGift {
  id: string
  name: string
  icon: string
  price: number
  category: string
  description: string
}

interface VirtualGiftsProps {
  recipientId: string
  onGiftSent?: () => void
}

const VirtualGifts: React.FC<VirtualGiftsProps> = ({ recipientId, onGiftSent }) => {
  const { user, profile } = useAuth()
  const [gifts, setGifts] = useState<VirtualGift[]>([])
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const defaultGifts: VirtualGift[] = [
    { id: '1', name: 'Rose', icon: 'flower', price: 5, category: 'romantic', description: 'Une belle rose rouge' },
    { id: '2', name: 'Café', icon: 'coffee', price: 3, category: 'casual', description: 'Un café pour commencer la journée' },
    { id: '3', name: 'Cœur', icon: 'heart', price: 10, category: 'romantic', description: 'Mon cœur pour toi' },
    { id: '4', name: 'Étoile', icon: 'star', price: 15, category: 'special', description: 'Tu es ma star' },
    { id: '5', name: 'Couronne', icon: 'crown', price: 25, category: 'luxury', description: 'Tu es ma reine/roi' },
    { id: '6', name: 'Diamant', icon: 'diamond', price: 50, category: 'luxury', description: 'Précieux comme un diamant' }
  ]

  useEffect(() => {
    setGifts(defaultGifts)
  }, [])

  const getGiftIcon = (iconName: string) => {
    switch (iconName) {
      case 'flower': return <Flower2 className="h-8 w-8" />
      case 'coffee': return <Coffee className="h-8 w-8" />
      case 'heart': return <Heart className="h-8 w-8" />
      case 'star': return <Star className="h-8 w-8" />
      case 'crown': return <Crown className="h-8 w-8" />
      case 'diamond': return <Diamond className="h-8 w-8" />
      default: return <Gift className="h-8 w-8" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'romantic': return 'from-violet-500 to-pink-500'
      case 'casual': return 'from-blue-500 to-cyan-500'
      case 'special': return 'from-purple-500 to-indigo-500'
      case 'luxury': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const sendGift = async () => {
    if (!selectedGift || !user) return

    setSending(true)
    try {
      // Vérifier les crédits de l'utilisateur (à implémenter)
      const userCredits = profile?.credits || 0
      if (userCredits < selectedGift.price) {
        alert('Crédits insuffisants')
        return
      }

      // Envoyer le cadeau
      await supabase
        .from('virtual_gifts_sent')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          gift_id: selectedGift.id,
          gift_name: selectedGift.name,
          gift_icon: selectedGift.icon,
          price: selectedGift.price,
          message: message,
          status: 'sent'
        })

      // Déduire les crédits
      await supabase
        .from('profiles')
        .update({ credits: userCredits - selectedGift.price })
        .eq('id', user.id)

      // Créer une notification
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'gift',
          title: 'Cadeau reçu !',
          message: `${profile?.full_name} vous a envoyé ${selectedGift.name}`,
          data: { 
            gift: selectedGift, 
            message: message,
            sender_id: user.id 
          }
        })

      setSelectedGift(null)
      setMessage('')
      onGiftSent?.()
      alert('Cadeau envoyé avec succès !')
    } catch (error) {
      console.error('Error sending gift:', error)
      alert('Erreur lors de l\'envoi du cadeau')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Gift className="h-12 w-12 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cadeaux virtuels</h2>
        <p className="text-gray-600">
          Envoyez un cadeau virtuel pour montrer votre intérêt
        </p>
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            onClick={() => setSelectedGift(gift)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedGift?.id === gift.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getCategoryColor(gift.category)} flex items-center justify-center text-white mx-auto mb-3`}>
              {getGiftIcon(gift.icon)}
            </div>
            <h3 className="font-semibold text-gray-800 text-center mb-1">
              {gift.name}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-2">
              {gift.description}
            </p>
            <div className="text-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                {gift.price} crédits
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Gift */}
      {selectedGift && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Envoyer {selectedGift.name}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message personnel (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ajoutez un message personnel..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Coût: <span className="font-semibold">{selectedGift.price} crédits</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedGift(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sendGift}
                disabled={sending}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
              >
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Display */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
        <p className="text-sm opacity-90">Vos crédits</p>
        <p className="text-2xl font-bold">{profile?.credits || 0}</p>
        <button className="bg-white text-purple-500 px-4 py-2 rounded-lg mt-2 hover:bg-gray-100 transition-colors">
          Acheter des crédits
        </button>
      </div>
    </div>
  )
}

export default VirtualGifts