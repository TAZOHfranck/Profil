import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdmin } from '../../contexts/AdminContext'
import NotificationCenter from '../Notifications/NotificationCenter'
import { Heart, MessageCircle, Search, User, Settings, LogOut, Bell, Shield, Crown } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      
      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchUnreadCount()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                AfrointroductionsHub
              </span>
            </Link>

            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/discover"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/discover')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Search className="h-5 w-5" />
                  <span>Découvrir</span>
                </Link>
                <Link
                  to="/matches"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/matches')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Matches</span>
                </Link>
                <Link
                  to="/messages"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/messages')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
                <Link
                  to="/safety"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/safety')
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Sécurité</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/admin')
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {profile?.photos && profile.photos.length > 0 ? (
                      <img
                        src={profile.photos[0]}
                        alt={profile.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <span className="hidden md:inline flex items-center space-x-1">
                      <span>{profile?.full_name || 'Profil'}</span>
                      {profile?.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
                      {profile?.is_verified && <Shield className="h-4 w-4 text-blue-500" />}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  )
}

export default Header