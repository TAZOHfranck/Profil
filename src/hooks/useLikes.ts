import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface UseLikesReturn {
  superLikesLeft: number
  handleLike: (profileId: string, isSuperLike?: boolean) => Promise<{ isMatch: boolean }>
  handlePass: (profileId: string) => Promise<void>
  getLikedProfiles: () => Promise<string[]>
  loading: boolean
  error: string | null
}

export const useLikes = (): UseLikesReturn => {
  const { user, profile } = useAuth()
  const [superLikesLeft, setSuperLikesLeft] = useState(profile?.is_premium ? 5 : 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkSuperLikesLeft()
    }
  }, [user])

  const checkSuperLikesLeft = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .rpc('check_super_like_usage', { user_uuid: user.id })

      if (error) throw error
      setSuperLikesLeft(data || 0)
    } catch (error) {
      console.error('Error checking super likes:', error)
      setError('Erreur lors de la vérification des Super Likes')
    }
  }

  const getLikedProfiles = async (): Promise<string[]> => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('liked_user_id')
        .eq('user_id', user.id)

      if (error) throw error
      return (data || []).map(like => like.liked_user_id)
    } catch (error) {
      console.error('Error fetching liked profiles:', error)
      setError('Erreur lors de la récupération des profils likés')
      return []
    }
  }

  const handleLike = async (profileId: string, isSuperLike = false): Promise<{ isMatch: boolean }> => {
    if (!user || !profile) throw new Error('Utilisateur non authentifié')
    setLoading(true)
    setError(null)

    try {
      // Vérifier les super likes disponibles
      if (isSuperLike) {
        const remaining = await checkSuperLikesLeft()
        if (remaining <= 0) {
          throw new Error('Vous n\'avez plus de Super Likes disponibles aujourd\'hui')
        }
      }

      // Vérifier si l'utilisateur a déjà liké ce profil
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('liked_user_id', profileId)
        .single()

      if (existingLike) {
        throw new Error('Vous avez déjà liké ce profil')
      }

      // Enregistrer la vue de profil
      await supabase
        .from('profile_views')
        .insert({ viewer_id: user.id, viewed_user_id: profileId })
        .on('conflict', () => {})

      // Ajouter le like
      const { error: likeError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          liked_user_id: profileId,
          is_super_like: isSuperLike,
          created_at: new Date().toISOString()
        })

      if (likeError) throw likeError

      // Mettre à jour le compteur de super likes
      if (isSuperLike) {
        setSuperLikesLeft(prev => Math.max(0, prev - 1))
      }

      // Vérifier si c'est un match
      const { data: mutualLike } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', profileId)
        .eq('liked_user_id', user.id)
        .single()

      // Si c'est un match, créer une conversation
      if (mutualLike) {
        await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: profileId,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          })
          .on('conflict', () => {})
      }

      // Créer une notification
      await supabase
        .from('notifications')
        .insert({
          user_id: profileId,
          type: mutualLike ? 'match' : (isSuperLike ? 'super_like' : 'like'),
          title: mutualLike ? '🎉 Nouveau match !' : (isSuperLike ? '⭐ Super Like reçu !' : '❤️ Nouveau like !'),
          message: mutualLike
            ? `Vous avez un nouveau match avec ${profile.full_name}`
            : `${profile.full_name} ${isSuperLike ? 'vous a envoyé un Super Like' : 'a aimé votre profil'}`,
          data: { 
            user_id: user.id,
            is_super_like: isSuperLike,
            user_name: profile.full_name,
            user_photo: profile.photos?.[0]
          },
          created_at: new Date().toISOString()
        })
        .on('conflict', () => {})

      return { isMatch: !!mutualLike }
    } catch (error) {
      console.error('Error handling like:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du like')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handlePass = async (profileId: string): Promise<void> => {
    if (!user) return
    setLoading(true)
    setError(null)
    
    try {
      // Enregistrer la vue du profil
      await supabase
        .from('profile_views')
        .insert({ viewer_id: user.id, viewed_user_id: profileId })
        .on('conflict', () => {})

      // Enregistrer le pass
      const { error: passError } = await supabase
        .from('passes')
        .insert({
          user_id: user.id,
          passed_user_id: profileId
        })

      if (passError) throw passError

      // Créer une notification pour le pass (optionnel)
      await supabase
        .from('notifications')
        .insert({
          user_id: profileId,
          type: 'pass',
          title: 'Nouveau pass',
          message: 'Quelqu\'un a passé votre profil',
          data: { user_id: user.id }
        })
        .on('conflict', () => {})

    } catch (error) {
      console.error('Error handling pass:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du pass')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    superLikesLeft,
    handleLike,
    handlePass,
    getLikedProfiles,
    loading,
    error
  }
}