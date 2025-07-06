import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { UserStats, MatchStats, MessageStats } from '../../types/admin'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Crown,
  Shield,
  AlertTriangle,
  Eye
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null)
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user statistics
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      if (profiles) {
        const userStatsData: UserStats = {
          total_users: profiles.length,
          active_users: profiles.filter(p => p.is_active).length,
          premium_users: profiles.filter(p => p.is_premium).length,
          verified_users: profiles.filter(p => p.is_verified).length,
          new_users_today: profiles.filter(p => new Date(p.created_at) >= today).length,
          new_users_week: profiles.filter(p => new Date(p.created_at) >= weekAgo).length,
          new_users_month: profiles.filter(p => new Date(p.created_at) >= monthAgo).length,
        }
        setUserStats(userStatsData)
      }

      // Fetch match statistics
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'mutual')

      if (matches) {
        const matchStatsData: MatchStats = {
          total_matches: matches.length,
          matches_today: matches.filter(m => new Date(m.created_at) >= today).length,
          matches_week: matches.filter(m => new Date(m.created_at) >= weekAgo).length,
          matches_month: matches.filter(m => new Date(m.created_at) >= monthAgo).length,
          average_matches_per_user: profiles ? matches.length / profiles.length : 0,
        }
        setMatchStats(matchStatsData)
      }

      // Fetch message statistics
      const { data: messages } = await supabase
        .from('messages')
        .select('*')

      if (messages) {
        const messageStatsData: MessageStats = {
          total_messages: messages.length,
          messages_today: messages.filter(m => new Date(m.created_at) >= today).length,
          messages_week: messages.filter(m => new Date(m.created_at) >= weekAgo).length,
          messages_month: messages.filter(m => new Date(m.created_at) >= monthAgo).length,
          average_messages_per_user: profiles ? messages.length / profiles.length : 0,
        }
        setMessageStats(messageStatsData)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  const StatCard: React.FC<{
    title: string
    value: number | string
    icon: React.ElementType
    color: string
    change?: string
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600">{change}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble de l'activité de la plateforme</p>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Utilisateurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Utilisateurs"
            value={userStats?.total_users || 0}
            icon={Users}
            color="bg-blue-500"
            change={`+${userStats?.new_users_today || 0} aujourd'hui`}
          />
          <StatCard
            title="Utilisateurs Actifs"
            value={userStats?.active_users || 0}
            icon={Eye}
            color="bg-green-500"
          />
          <StatCard
            title="Membres Premium"
            value={userStats?.premium_users || 0}
            icon={Crown}
            color="bg-yellow-500"
          />
          <StatCard
            title="Profils Vérifiés"
            value={userStats?.verified_users || 0}
            icon={Shield}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Activity Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité de la Plateforme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Matches"
            value={matchStats?.total_matches || 0}
            icon={Heart}
            color="bg-violet-500"
            change={`+${matchStats?.matches_today || 0} aujourd'hui`}
          />
          <StatCard
            title="Messages Envoyés"
            value={messageStats?.total_messages || 0}
            icon={MessageCircle}
            color="bg-indigo-500"
            change={`+${messageStats?.messages_today || 0} aujourd'hui`}
          />
          <StatCard
            title="Croissance Hebdomadaire"
            value={`+${userStats?.new_users_week || 0}`}
            icon={TrendingUp}
            color="bg-emerald-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {userStats?.new_users_today || 0} nouveaux utilisateurs aujourd'hui
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {matchStats?.matches_today || 0} nouveaux matches aujourd'hui
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {messageStats?.messages_today || 0} messages envoyés aujourd'hui
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <span className="text-sm font-medium">Gérer Utilisateurs</span>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-violet-500" />
                <span className="text-sm font-medium">Signalements</span>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <span className="text-sm font-medium">Modération</span>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                <Crown className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <span className="text-sm font-medium">Premium</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard