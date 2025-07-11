import React, { useState, useEffect, useRef } from 'react'
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
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  const isAdmin = profile?.role === 'admin' || profile?.email === 'admin@meetup.com'

  // Close user menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
                {[
                  { to: '/discover', label: 'Découvrir', icon: Search },
                  { to: '/matches', label: 'Matches', icon: Heart },
                  { to: '/messages', label: 'Messages', icon: MessageCircle },
                  { to: '/events', label: 'Événements', icon: Calendar },
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
                      isActive(to)
                        ? 'bg-violet-50 text-violet-600'
                        : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                    {to === '/messages' && (
                      <MessageCounter className="absolute -top-1 -right-1" />
                    )}
                  </Link>
                ))}
              </nav>
            )}

            {/* User menu */}
            {user && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <NotificationCounter className="absolute -top-1 -right-1" />
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex items-center space-x-3 p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={
                          profile?.avatar_url ||
                          (profile?.photos?.[0] ?? '/default-avatar.png')
                        }
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500 ring-offset-2"
                      />
                      {profile?.is_online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-700">
                        {profile?.full_name || 'Mon Profil'}
                      </span>
                      {profile?.is_premium && (
                        <div className="flex items-center space-x-1">
                          <Crown className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-500">Premium</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Animated dropdown menu */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 transform transition-all origin-top-right ${
                      showUserMenu
                        ? 'scale-100 opacity-100 visible'
                        : 'scale-95 opacity-0 invisible pointer-events-none'
                    }`}
                  >
                    {[
                      { to: '/profile', label: 'Mon Profil', icon: User },
                      { to: '/profile/settings', label: 'Paramètres', icon: Settings },
                      { to: '/profile/premium', label: 'Premium', icon: Crown },
                      { to: '/compatibility', label: 'Test de Compatibilité', icon: Star },
                      { to: '/verification', label: 'Vérification', icon: Shield },
                      { to: '/blog', label: 'Blog', icon: BookOpen },
                      ...(isAdmin
                        ? [{ to: '/admin', label: 'Admin', icon: Shield }]
                        : []),
                    ].map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-600 border-t border-gray-100 transition"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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
