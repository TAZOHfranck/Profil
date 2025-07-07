import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdmin } from '../../contexts/AdminContext'
import { useMessages } from '../../contexts/MessagesContext'
import NotificationCenter from '../Notifications/NotificationCenter'
import MessageCounter from '../Chat/MessageCounter'
import NotificationCounter from '../Notifications/NotificationCounter'
import { 
  Heart, 
  MessageCircle, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Shield,
  Calendar,
  BookOpen,
  Star,
  Crown
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  const isAdmin = profile?.role === 'admin' || profile?.email === 'admin@meetup.com'

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-violet-500 to-orange-500 p-2 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-orange-500 bg-clip-text text-transparent">
                MeetUp
              </span>
            </Link>

            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/discover"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/discover') ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'}`}
                >
                  <Search className="h-5 w-5" />
                  <span>Découvrir</span>
                </Link>

                <Link
                  to="/matches"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/matches') ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'}`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Matches</span>
                </Link>

                <Link
                  to="/messages"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${isActive('/messages') ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'}`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Messages</span>
                  <MessageCounter className="absolute -top-1 -right-1" />
                </Link>

                <Link
                  to="/events"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/events') ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'}`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Événements</span>
                </Link>
              </nav>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <NotificationCounter className="absolute -top-1 -right-1" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={profile?.avatar_url || (profile?.photos && profile.photos.length > 0 ? profile.photos[0] : '/default-avatar.png')}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500 ring-offset-2"
                      />
                      {profile?.is_online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-700">{profile?.full_name || 'Mon Profil'}</span>
                      {profile?.is_premium && (
                        <div className="flex items-center space-x-1">
                          <Crown className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-500">Premium</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <User className="h-5 w-5" />
                        <span>Mon Profil</span>
                      </Link>

                      <Link
                        to="/profile/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Paramètres</span>
                      </Link>

                      <Link
                        to="/profile/premium"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Crown className="h-5 w-5" />
                        <span>Premium</span>
                      </Link>

                      <Link
                        to="/compatibility"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Star className="h-5 w-5" />
                        <span>Test de Compatibilité</span>
                      </Link>

                      <Link
                        to="/verification"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Shield className="h-5 w-5" />
                        <span>Vérification</span>
                      </Link>

                      <Link
                        to="/blog"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <BookOpen className="h-5 w-5" />
                        <span>Blog</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                        >
                          <Shield className="h-5 w-5" />
                          <span>Admin</span>
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600 border-t border-gray-100"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {showNotifications && (
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  )
}

export default Header