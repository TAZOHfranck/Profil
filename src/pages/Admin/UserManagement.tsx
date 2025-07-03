import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../../lib/supabase'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Crown, 
  Ban, 
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'premium' | 'verified'>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ))
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active) ||
                         (filterStatus === 'premium' && user.is_premium) ||
                         (filterStatus === 'verified' && user.is_verified)

    return matchesSearch && matchesFilter
  })

  const UserModal: React.FC<{ user: Profile; onClose: () => void }> = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Détails de l'utilisateur</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet</label>
              <p className="mt-1 text-sm text-gray-900">{user.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Âge</label>
              <p className="mt-1 text-sm text-gray-900">{user.age} ans</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Localisation</label>
              <p className="mt-1 text-sm text-gray-900">{user.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Genre</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{user.gender}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Recherche</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{user.looking_for}</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <p className="mt-1 text-sm text-gray-900">{user.bio || 'Aucune bio'}</p>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
            <div className="grid grid-cols-3 gap-2">
              {user.photos && user.photos.length > 0 ? (
                user.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-3">Aucune photo</p>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex space-x-4">
            <button
              onClick={() => updateUserStatus(user.id, { is_verified: !user.is_verified })}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                user.is_verified 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>{user.is_verified ? 'Retirer vérification' : 'Vérifier'}</span>
            </button>
            
            <button
              onClick={() => updateUserStatus(user.id, { is_premium: !user.is_premium })}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                user.is_premium 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              <Crown className="h-4 w-4" />
              <span>{user.is_premium ? 'Retirer Premium' : 'Activer Premium'}</span>
            </button>
            
            <button
              onClick={() => updateUserStatus(user.id, { is_active: !user.is_active })}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                user.is_active 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Ban className="h-4 w-4" />
              <span>{user.is_active ? 'Suspendre' : 'Activer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="premium">Premium</option>
              <option value="verified">Vérifiés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.photos && user.photos.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.photos[0]}
                            alt={user.full_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      {user.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {user.is_verified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.last_seen).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

export default UserManagement