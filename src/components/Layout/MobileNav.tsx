import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, MessageCircle, Search, User, Home, Calendar, BookOpen } from 'lucide-react'

const MobileNav: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Accueil</span>
        </Link>
        <Link
          to="/discover"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/discover')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Découvrir</span>
        </Link>
        <Link
          to="/matches"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/matches')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">Matches</span>
        </Link>
        <Link
          to="/messages"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/messages')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link
          to="/events"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/events')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Événements</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/profile')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profil</span>
        </Link>
      </div>
    </nav>
  )
}

export default MobileNav