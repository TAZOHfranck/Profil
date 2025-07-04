import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Session initiale:', session?.user?.email || 'Aucune session')
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Changement d\'authentification:', event, session?.user?.email || 'Aucun utilisateur')
      
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('📋 Récupération du profil pour:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If no rows found and we haven't exceeded retry limit, retry after a delay
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`⏳ Profil non trouvé, nouvelle tentative... (${retryCount + 1}/3)`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }
        
        if (error.code === 'PGRST116') {
          console.log('⚠️ Profil non trouvé après plusieurs tentatives')
          // Le profil n'existe pas encore, c'est normal pour un nouvel utilisateur
          return
        }
        
        throw error
      }
      
      console.log('✅ Profil récupéré:', data.full_name)
      setProfile(data)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error)
      // Don't throw the error to prevent app crashes
      // The profile will remain null and the app can handle this state
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion avec email:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      throw error
    }
    
    console.log('✅ Connexion réussie')
  }

  const signInWithGoogle = async () => {
    console.log('🔐 Tentative de connexion Google...')
    
    try {
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
        console.error('❌ Erreur OAuth Google:', error.message)
        throw error
      }
      
      console.log('✅ Redirection Google initiée')
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification Google:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    console.log('📝 Tentative d\'inscription avec email:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
        }
      }
    })
    
    if (error) {
      console.error('❌ Erreur d\'inscription:', error.message)
      throw error
    }

    if (data.user) {
      console.log('✅ Inscription réussie, création du profil...')
      
      // Attendre un peu pour que le trigger de création de profil s'exécute
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{ 
            id: data.user.id, 
            email, 
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        
        if (profileError) {
          console.error('⚠️ Erreur lors de la création du profil:', profileError.message)
          // Ne pas faire échouer l'inscription si le profil existe déjà
          if (!profileError.message.includes('duplicate key')) {
            throw profileError
          }
        }
        
        console.log('✅ Profil créé avec succès')
      } catch (profileError) {
        console.error('❌ Erreur lors de la création du profil:', profileError)
        // Ne pas faire échouer l'inscription pour une erreur de profil
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 Déconnexion...')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Erreur de déconnexion:', error.message)
      throw error
    }
    
    console.log('✅ Déconnexion réussie')
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    console.log('📝 Mise à jour du profil...')
    
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('❌ Erreur de mise à jour du profil:', error.message)
      throw error
    }
    
    console.log('✅ Profil mis à jour')
    
    // Update local state
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}