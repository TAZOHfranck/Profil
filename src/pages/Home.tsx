import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Heart, Users, MessageCircle, Shield, Star, ArrowRight } from 'lucide-react'

const Home: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Trouvez l'amour
            </span>
            <br />
            <span className="text-gray-800">authentique</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de célibataires à la recherche de relations sérieuses et durables. 
            Votre âme sœur vous attend sur AfrointroductionsHub.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-red-500 text-red-500 px-8 py-4 rounded-full hover:bg-red-500 hover:text-white transition-colors"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Profils vérifiés</h3>
            <p className="text-gray-600">
              Tous les profils sont vérifiés pour garantir des rencontres authentiques et sécurisées.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Messagerie sécurisée</h3>
            <p className="text-gray-600">
              Échangez en toute sécurité avec nos outils de messagerie avancés et protection des données.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Matches compatibles</h3>
            <p className="text-gray-600">
              Notre algorithme intelligent vous propose des profils compatibles avec vos critères.
            </p>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Histoires de réussite
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <blockquote className="text-lg italic text-gray-600 mb-4">
                "J'ai trouvé l'amour de ma vie sur AfrointroductionsHub. Après 6 mois de discussions, 
                nous nous sommes mariés l'année dernière !"
              </blockquote>
              <p className="font-semibold text-gray-800">Marie & Jean</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="h-12 w-12 text-white" />
              </div>
              <blockquote className="text-lg italic text-gray-600 mb-4">
                "Une plateforme exceptionnelle qui m'a permis de rencontrer des personnes formidables. 
                Recommandé à 100% !"
              </blockquote>
              <p className="font-semibold text-gray-800">Sarah & David</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-red-500 mb-2">50K+</div>
            <div className="text-gray-600">Membres actifs</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-500 mb-2">15K+</div>
            <div className="text-gray-600">Couples formés</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-red-500 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à trouver l'amour ?
            </h2>
            <p className="text-red-100 mb-6 text-lg">
              Rejoignez des milliers de célibataires et commencez votre histoire d'amour dès aujourd'hui.
            </p>
            <Link
              to="/register"
              className="bg-white text-red-500 px-8 py-4 rounded-full hover:bg-red-50 transition-colors inline-flex items-center font-semibold"
            >
              Créer mon profil gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home