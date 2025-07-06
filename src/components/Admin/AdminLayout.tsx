import React, { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare, 
  Heart,
  AlertTriangle,
  Home,
  LogOut,
  Menu,
  X,
  Crown,
  Eye,
  FileText
} from 'lucide-react'

const AdminLayout: React.FC = () => {
  const { adminUser } = useAdmin()
  const { signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3, permission: 'all' },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users, permission: 'users' },
    { name: 'Modération', href: '/admin/moderation', icon: Shield, permission: 'content' },
    { name: 'Signalements', href: '/admin/reports', icon: AlertTriangle, permission: 'reports' },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare, permission: 'content' },
    { name: 'Matches', href: '/admin/matches', icon: Heart, permission: 'analytics' },
    { name: 'Premium', href: '/admin/premium', icon: Crown, permission: 'users' },
    { name: 'Analytics', href: '/admin/analytics', icon: Eye, permission: 'analytics' },
    { name: 'Logs', href: '/admin/logs', icon: FileText, permission: 'all' },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings, permission: 'settings' },
  ]

  const hasPermission = (permission: string) => {
    if (!adminUser) return false
    return adminUser.permissions.includes('all') || adminUser.permissions.includes(permission)
  }

  const filteredNavigation = navigation.filter(item => hasPermission(item.permission))

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-violet-100 text-violet-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-violet-100 text-violet-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {adminUser?.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{adminUser?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{adminUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Link
                to="/"
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Site
              </Link>
              <button
                onClick={signOut}
                className="flex-1 bg-violet-100 text-violet-700 px-3 py-2 rounded-md text-sm hover:bg-violet-200 flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sortir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout