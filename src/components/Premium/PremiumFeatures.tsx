import React from 'react'
import { Crown, Star, Eye, MessageCircle, Search, Zap, Shield, Heart } from 'lucide-react'

interface PremiumFeaturesProps {
  onUpgrade: () => void
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ onUpgrade }) => {
  const features = [
    {
      icon: Crown,
      title: 'Priorité dans les résultats',
      description: 'Votre profil apparaît en premier dans les recherches',
      color: 'text-yellow-500'
    },
    {
      icon: Eye,
      title: 'Voir qui vous a liké',
      description: 'Découvrez tous les profils qui ont aimé le vôtre',
      color: 'text-blue-500'
    },
    {
      icon: MessageCircle,
      title: 'Messages illimités',
      description: 'Envoyez autant de messages que vous voulez',
      color: 'text-green-500'
    },
    {
      icon: Search,
      title: 'Filtres avancés',
      description: 'Recherchez avec des critères précis et détaillés',
      color: 'text-purple-500'
    },
    {
      icon: Zap,
      title: 'Super Likes',
      description: '5 Super Likes par jour pour vous démarquer',
      color: 'text-orange-500'
    },
    {
      icon: Shield,
      title: 'Navigation privée',
      description: 'Parcourez les profils de manière anonyme',
      color: 'text-gray-500'
    },
    {
      icon: Star,
      title: 'Badge Premium',
      description: 'Montrez votre statut Premium sur votre profil',
      color: 'text-yellow-500'
    },
    {
      icon: Heart,
      title: 'Likes illimités',
      description: 'Aimez autant de profils que vous voulez',
      color: 'text-violet-500'
    }
  ]

  const plans = [
    {
      name: 'Premium 1 mois',
      price: '29.99€',
      period: '/mois',
      popular: false
    },
    {
      name: 'Premium 3 mois',
      price: '19.99€',
      period: '/mois',
      popular: true,
      savings: 'Économisez 33%'
    },
    {
      name: 'Premium 6 mois',
      price: '14.99€',
      period: '/mois',
      popular: false,
      savings: 'Économisez 50%'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Passez à Premium
        </h1>
        <p className="text-lg text-gray-600">
          Débloquez toutes les fonctionnalités pour maximiser vos chances de trouver l'amour
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4`}>
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Choisissez votre plan
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl border-2 p-6 ${
                plan.popular
                  ? 'border-yellow-500 bg-gradient-to-b from-yellow-50 to-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h3>
                
                {plan.savings && (
                  <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-block mb-4">
                    {plan.savings}
                  </div>
                )}

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">
                    {plan.period}
                  </span>
                </div>

                <button
                  onClick={onUpgrade}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Choisir ce plan
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Annulation possible à tout moment • Paiement sécurisé • Support 24/7
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-violet-500 to-orange-500 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold text-center mb-8">
          Ce que disent nos membres Premium
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
              ))}
            </div>
            <p className="text-white mb-4">
              "Grâce à Premium, j'ai trouvé l'amour de ma vie en seulement 2 mois ! 
              Les filtres avancés m'ont permis de trouver exactement ce que je cherchais."
            </p>
            <p className="text-violet-100 font-semibold">
              - Marie, 28 ans
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
              ))}
            </div>
            <p className="text-white mb-4">
              "Le fait de voir qui m'a liké a complètement changé mon expérience. 
              Plus besoin de deviner, je peux directement engager la conversation !"
            </p>
            <p className="text-violet-100 font-semibold">
              - David, 32 ans
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumFeatures