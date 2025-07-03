import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ReportedContent } from '../../types/admin'
import { 
  AlertTriangle, 
  Eye, 
  Check, 
  X, 
  Clock,
  Filter,
  Search
} from 'lucide-react'

const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<ReportedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reported_user:profiles!reports_reported_user_id_fkey(*),
          reporter:profiles!reports_reporter_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedReports: ReportedContent[] = (data || []).map(report => ({
        id: report.id,
        type: 'profile', // You can extend this based on your needs
        reported_user: {
          id: report.reported_user.id,
          full_name: report.reported_user.full_name,
          email: report.reported_user.email,
          photos: report.reported_user.photos || []
        },
        reporter: {
          id: report.reporter.id,
          full_name: report.reporter.full_name,
          email: report.reporter.email
        },
        reason: report.reason,
        description: report.description,
        status: report.status,
        created_at: report.created_at
      }))

      setReports(formattedReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)

      if (error) throw error

      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: status as any } : report
      ))
    } catch (error) {
      console.error('Error updating report status:', error)
    }
  }

  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || report.status === filterStatus
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'dismissed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonText = (reason: string) => {
    const reasons: { [key: string]: string } = {
      'inappropriate_content': 'Contenu inapproprié',
      'fake_profile': 'Faux profil',
      'harassment': 'Harcèlement',
      'spam': 'Spam',
      'other': 'Autre'
    }
    return reasons[reason] || reason
  }

  const ReportModal: React.FC<{ report: ReportedContent; onClose: () => void }> = ({ report, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Détails du signalement</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Report Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Signalé par</label>
              <p className="mt-1 text-sm text-gray-900">{report.reporter.full_name}</p>
              <p className="text-xs text-gray-500">{report.reporter.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Utilisateur signalé</label>
              <p className="mt-1 text-sm text-gray-900">{report.reported_user.full_name}</p>
              <p className="text-xs text-gray-500">{report.reported_user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Raison</label>
              <p className="mt-1 text-sm text-gray-900">{getReasonText(report.reason)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(report.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
              {report.description || 'Aucune description fournie'}
            </p>
          </div>

          {/* Reported User Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos de l'utilisateur signalé</label>
            <div className="grid grid-cols-3 gap-2">
              {report.reported_user.photos.length > 0 ? (
                report.reported_user.photos.map((photo, index) => (
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

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                updateReportStatus(report.id, 'reviewed')
                onClose()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <Eye className="h-4 w-4" />
              <span>Marquer comme examiné</span>
            </button>
            
            <button
              onClick={() => {
                updateReportStatus(report.id, 'resolved')
                onClose()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <Check className="h-4 w-4" />
              <span>Résoudre</span>
            </button>
            
            <button
              onClick={() => {
                updateReportStatus(report.id, 'dismissed')
                onClose()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
              <span>Rejeter</span>
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Signalements</h1>
        <p className="text-gray-600">Examinez et gérez les signalements d'utilisateurs</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tous les signalements</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Examinés</option>
            <option value="resolved">Résolus</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signalement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur signalé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Signalé par {report.reporter.full_name}
                        </div>
                        <div className="text-sm text-gray-500">{report.reporter.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {report.reported_user.photos.length > 0 ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={report.reported_user.photos[0]}
                            alt={report.reported_user.full_name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {report.reported_user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {report.reported_user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">{report.reported_user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getReasonText(report.reason)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status === 'pending' && 'En attente'}
                      {report.status === 'reviewed' && 'Examiné'}
                      {report.status === 'resolved' && 'Résolu'}
                      {report.status === 'dismissed' && 'Rejeté'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedReport(report)
                        setShowReportModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false)
            setSelectedReport(null)
          }}
        />
      )}
    </div>
  )
}

export default ReportsManagement