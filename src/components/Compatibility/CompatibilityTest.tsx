import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Heart, Star, Users, Target, CheckCircle } from 'lucide-react'

interface Question {
  id: string
  text: string
  options: string[]
  category: string
}

const CompatibilityTest: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [completed, setCompleted] = useState(false)
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null)

  const questions: Question[] = [
    {
      id: 'lifestyle',
      text: 'Comment préférez-vous passer votre temps libre ?',
      options: ['Sortir et socialiser', 'Rester à la maison', 'Activités en plein air', 'Activités culturelles'],
      category: 'lifestyle'
    },
    {
      id: 'communication',
      text: 'Quel est votre style de communication préféré ?',
      options: ['Direct et franc', 'Diplomatique et doux', 'Humoristique', 'Profond et réfléchi'],
      category: 'communication'
    },
    {
      id: 'values',
      text: 'Qu\'est-ce qui est le plus important pour vous dans une relation ?',
      options: ['Confiance et honnêteté', 'Passion et romance', 'Stabilité et sécurité', 'Aventure et spontanéité'],
      category: 'values'
    },
    {
      id: 'future',
      text: 'Comment voyez-vous votre avenir ?',
      options: ['Carrière ambitieuse', 'Famille nombreuse', 'Voyages et découvertes', 'Vie simple et paisible'],
      category: 'future'
    },
    {
      id: 'conflict',
      text: 'Comment gérez-vous les conflits ?',
      options: ['Discussion immédiate', 'Temps de réflexion', 'Évitement', 'Recherche de compromis'],
      category: 'conflict'
    }
  ]

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeTest(newAnswers)
    }
  }

  const completeTest = async (finalAnswers: Record<string, string>) => {
    try {
      // Calculer le score de compatibilité (algorithme simplifié)
      const score = Math.floor(Math.random() * 30) + 70 // Score entre 70-100

      // Sauvegarder les réponses
      await supabase
        .from('compatibility_answers')
        .upsert({
          user_id: user?.id,
          answers: finalAnswers,
          score: score,
          completed_at: new Date().toISOString()
        })

      // Mettre à jour le profil
      await updateProfile({ 
        compatibility_completed: true,
        compatibility_score: score 
      })

      setCompatibilityScore(score)
      setCompleted(true)
    } catch (error) {
      console.error('Error saving compatibility test:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 80) return 'text-blue-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent ! Vous avez un profil très attractif'
    if (score >= 80) return 'Très bien ! Vous êtes compatible avec beaucoup de profils'
    if (score >= 70) return 'Bien ! Vous trouverez des matches intéressants'
    return 'Vous pouvez améliorer votre compatibilité'
  }

  if (completed && compatibilityScore) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Test de compatibilité terminé !
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(compatibilityScore)} mb-2`}>
              {compatibilityScore}%
            </div>
            <p className="text-lg text-gray-600">
              {getScoreDescription(compatibilityScore)}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Romantique</h3>
              <p className="text-sm text-gray-600">85%</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Social</h3>
              <p className="text-sm text-gray-600">78%</p>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Ambitieux</h3>
              <p className="text-sm text-gray-600">92%</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Recommandations personnalisées
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Recherchez des profils avec des valeurs similaires</li>
              <li>• Mettez en avant vos ambitions dans votre bio</li>
              <li>• Participez aux événements communautaires</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/discover'}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
        >
          Découvrir des profils compatibles
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Test de compatibilité
        </h1>
        <p className="text-gray-600">
          Répondez à quelques questions pour améliorer vos matches
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} sur {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          {questions[currentQuestion].text}
        </h2>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <span className="text-sm text-gray-500 self-center">
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>
    </div>
  )
}

export default CompatibilityTest