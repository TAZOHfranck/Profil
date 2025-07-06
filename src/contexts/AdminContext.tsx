import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { AdminUser } from '../types/admin'

interface AdminContextType {
  isAdmin: boolean
  adminUser: AdminUser | null
  loading: boolean
  checkAdminStatus: () => Promise<boolean>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    } else {
      setIsAdmin(false)
      setAdminUser(null)
      setLoading(false)
    }
  }, [user])

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setLoading(false)
      return false
    }

    try {
      setLoading(true)
      
      // Check if user is admin (you can implement this check based on your needs)
      // For now, we'll check if the user email is in a list of admin emails
      // or if there's an admin_users table
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Simple admin check - you can modify this logic
      const adminEmails = ['admin@MeetUp.com', 'moderator@MeetUp.com']
      const userIsAdmin = adminEmails.includes(data.email) || data.email.endsWith('@admin.com')

      if (userIsAdmin) {
        const adminUserData: AdminUser = {
          id: data.id,
          email: data.email,
          role: data.email.includes('super') ? 'super_admin' : 
                data.email.includes('admin') ? 'admin' : 'moderator',
          created_at: data.created_at,
          last_login: new Date().toISOString(),
          permissions: getPermissionsByRole(data.email.includes('super') ? 'super_admin' : 
                                          data.email.includes('admin') ? 'admin' : 'moderator')
        }
        
        setAdminUser(adminUserData)
        setIsAdmin(true)
        return true
      } else {
        setIsAdmin(false)
        setAdminUser(null)
        return false
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      setAdminUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }

  const getPermissionsByRole = (role: string): string[] => {
    switch (role) {
      case 'super_admin':
        return ['all']
      case 'admin':
        return ['users', 'content', 'reports', 'analytics', 'settings']
      case 'moderator':
        return ['content', 'reports']
      default:
        return []
    }
  }

  const value = {
    isAdmin,
    adminUser,
    loading,
    checkAdminStatus,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}