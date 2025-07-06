import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalMatches: number
  totalMessages: number
  premiumUsers: number
  reportsCount: number
  verificationRequests: number
  revenue: number
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    premiumUsers: 0,
    reportsCount: 0,
    verificationRequests: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'verification' | 'revenue'>('overview')

  // Vérifier si l'utilisateur est admin
  const isAdmin = profile?.role === 'admin' || profile?.email === 'admin@afrointroductions.com'

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalMatches },
        { count: totalMessages },
        { count: premiumUsers },
        { count: reportsCount },
        { count: verificationRequests }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'mutual'),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalMatches: totalMatches || 0,
        totalMessages: totalMessages || 0,
        premiumUsers: premiumUsers || 0,
        reportsCount: reportsCount || 0,
        verificationRequests: verificationRequests || 0,
        revenue: (premiumUsers || 0) * 29.99 // Estimation basique
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-violet-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-violet-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Administration</h1>
          <p className="text-gray-600">Tableau de bord administrateur</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                { key: 'users', label: 'Utilisateurs', icon: Users },
                { key: 'reports', label: 'Signalements', icon: AlertTriangle },
                { key: 'verification', label: 'Vérifications', icon: CheckCircle },
                { key: 'revenue', label: 'Revenus', icon: DollarSign }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                    <div className="text-sm text-blue-700">Utilisateurs totaux</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                    <div className="text-sm text-green-700">Utilisateurs actifs</div>
                  </div>
                  
                  <div className="bg-violet-50 rounded-xl p-6 text-center">
                    <Heart className="h-8 w-8 text-violet-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-violet-600">{stats.totalMatches}</div>
                    <div className="text-sm text-violet-700">Matches créés</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{stats.totalMessages}</div>
                    <div className="text-sm text-purple-700">Messages envoyés</div>
                  </div>
                </div>

                {/* Premium & Reports */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-yellow-800">Utilisateurs Premium</h3>
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.premiumUsers}</div>
                    <div className="text-sm text-yellow-700">
                      {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% du total
                    </div>
                  </div>

                  <div className="bg-violet-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-violet-800">Signalements en attente</h3>
                      <AlertTriangle className="h-6 w-6 text-violet-500" />
                    </div>
                    <div className="text-3xl font-bold text-violet-600 mb-2">{stats.reportsCount}</div>
                    <div className="text-sm text-violet-700">Nécessitent une action</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
                      Modérer les profils
                    </button>
                    <button className="bg-violet-500 text-white p-4 rounded-lg hover:bg-violet-600 transition-colors">
                      Traiter les signalements
                    </button>
                    <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
                      Valider les vérifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Gestion des utilisateurs</h2>
                <UserManagement />
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Signalements</h2>
                <ReportsManagement />
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Demandes de vérification</h2>
                <VerificationManagement />
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Revenus</h2>
                <RevenueManagement revenue={stats.revenue} premiumUsers={stats.premiumUsers} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composants de gestion (simplifiés pour l'exemple)
const UserManagement: React.FC = () => (
  <div className="bg-white rounded-lg border p-4">
    <p className="text-gray-600">Interface de gestion des utilisateurs à implémenter</p>
  </div>
)

const ReportsManagement: React.FC = () => (
  <div className="bg-white rounded-lg border p-4">
    <p className="text-gray-600">Interface de gestion des signalements à implémenter</p>
  </div>
)

const VerificationManagement: React.FC = () => (
  <div className="bg-white rounded-lg border p-4">
    <p className="text-gray-600">Interface de gestion des vérifications à implémenter</p>
  </div>
)

const RevenueManagement: React.FC<{ revenue: number; premiumUsers: number }> = ({ revenue, premiumUsers }) => (
  <div className="space-y-4">
    <div className="bg-green-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Revenus mensuels estimés</h3>
      <div className="text-3xl font-bold text-green-600">{revenue.toFixed(2)}€</div>
      <div className="text-sm text-green-700">Basé sur {premiumUsers} abonnements Premium</div>
    </div>
  </div>
)

export default AdminDashboard