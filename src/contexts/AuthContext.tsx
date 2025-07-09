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
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger le profil à partir de Supabase
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Erreur fetchProfile:', error.message)
        return null
      }

      return data
    } catch (err) {
      console.error('❌ Exception fetchProfile:', err)
      return null
    }
  }

  // Chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)

      const { data, error } = await supabase.auth.getSession()
      const currentUser = data?.session?.user ?? null
      setUser(currentUser)

      const cachedProfile = localStorage.getItem('profile')
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile))
      }

      if (currentUser) {
        const freshProfile = await fetchProfile(currentUser.id)
        if (freshProfile) {
          setProfile(freshProfile)
          localStorage.setItem('profile', JSON.stringify(freshProfile))
        } else {
          setProfile(null)
          localStorage.removeItem('profile')
        }
      }

      setLoading(false)
    }

    loadInitialData()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      const newUser = session?.user ?? null
      setUser(newUser)

      if (newUser) {
        const freshProfile = await fetchProfile(newUser.id)
        if (freshProfile) {
          setProfile(freshProfile)
          localStorage.setItem('profile', JSON.stringify(freshProfile))
        } else {
          setProfile(null)
          localStorage.removeItem('profile')
        }
      } else {
        setProfile(null)
        localStorage.removeItem('profile')
      }

      setLoading(false)
    })

    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession()
      const currentUser = data?.session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const freshProfile = await fetchProfile(currentUser.id)
        if (freshProfile) {
          setProfile(freshProfile)
          localStorage.setItem('profile', JSON.stringify(freshProfile))
        }
      }
    }, 3 * 60 * 1000)

    return () => {
      authListener.subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  // Auth handlers

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/discover`,
      },
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.user) {
      // Attendre un petit délai pour éviter une course
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { error: upsertError } = await supabase.from('profiles').upsert([{
        id: data.user.id,
        email,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])

      if (upsertError) throw upsertError
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    localStorage.removeItem('profile')
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) throw error

    const updated = { ...profile, ...updates } as Profile
    setProfile(updated)
    localStorage.setItem('profile', JSON.stringify(updated))
  }

  const value: AuthContextType = {
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
