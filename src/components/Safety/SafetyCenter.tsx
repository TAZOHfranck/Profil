import React, { useState } from 'react'
import { Shield, AlertTriangle, Phone, MessageCircle, Eye, Lock, Heart } from 'lucide-react'

const SafetyCenter: React.FC = () => {
  const [reportType, setReportType] = useState('')
  const [reportDescription, setReportDescription] = useState('')

  const safetyTips = [
    {
      icon: Eye,
      title: 'Rencontrez-vous en public',
      description: 'Pour votre premier rendez-vous, choisissez toujours un lieu public et fréquenté.'
    },
    {
      icon: Phone,
      title: 'Informez vos proches',
      description: 'Dites à un ami ou un membre de votre famille où vous allez et avec qui.'
    },
    {
      icon: Lock,
      title: 'Protégez vos informations',
      description: 'Ne partagez jamais vos informations personnelles trop rapidement.'
    },
    {
      icon: Heart,
      title: 'Faites confiance à votre instinct',
      description: 'Si quelque chose vous semble suspect, n\'hésitez pas à mettre fin à la conversation.'
    }
  ]

  const reportReasons = [
    'Contenu inapproprié',
    'Faux profil',
    'Harcèlement',
    'Spam',
    'Comportement suspect',
    'Autre'
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Centre de Sécurité</h1>
        <p className="text-lg text-gray-600">
          Votre sécurité est notre priorité. Découvrez nos conseils et outils de protection.
        </p>
      </div>

      {/* Safety Tips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Conseils de Sécurité</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {safetyTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <tip.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Signaler un Problème</h2>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de problème
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Sélectionnez un type</option>
              {reportReasons.map((reason, index) => (
                <option key={index} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Décrivez le problème en détail..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Envoyer le Signalement
          </button>
        </form>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-800 mb-4">Contacts d'Urgence</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-red-600" />
            <span className="text-red-800">Police : 17</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-red-600" />
            <span className="text-red-800">SAMU : 15</span>
          </div>
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">Numéro national d'information pour les femmes victimes de violences : 3919</span>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Paramètres de Confidentialité</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800">Profil visible</h3>
              <p className="text-sm text-gray-600">Contrôlez qui peut voir votre profil</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800">Statut en ligne</h3>
              <p className="text-sm text-gray-600">Affichez votre statut en ligne</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800">Lecture des messages</h3>
              <p className="text-sm text-gray-600">Confirmez la lecture de vos messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SafetyCenter