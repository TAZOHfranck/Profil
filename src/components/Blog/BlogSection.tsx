import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BookOpen, Calendar, User, Heart, MessageCircle, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  image_url?: string
  published_at: string
  likes_count: number
  comments_count: number
  tags: string[]
}

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<'all' | 'dating-tips' | 'success-stories' | 'lifestyle'>('all')

  // Articles par défaut pour la démo
  const defaultPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Comment créer un profil attractif sur MeetUp',
      excerpt: 'Découvrez les secrets pour créer un profil qui attire l\'attention et génère des matches.',
      content: 'Votre profil est votre première impression...',
      author: 'Équipe MeetUp',
      category: 'dating-tips',
      image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      published_at: '2024-01-15T10:00:00Z',
      likes_count: 45,
      comments_count: 12,
      tags: ['profil', 'conseils', 'photos']
    },
    {
      id: '2',
      title: 'Histoire de réussite : Marie et Jean se sont mariés !',
      excerpt: 'Découvrez comment Marie et Jean ont trouvé l\'amour sur notre plateforme.',
      content: 'Il était une fois...',
      author: 'Marie & Jean',
      category: 'success-stories',
      image_url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
      published_at: '2024-01-10T14:30:00Z',
      likes_count: 128,
      comments_count: 34,
      tags: ['mariage', 'success', 'témoignage']
    },
    {
      id: '3',
      title: 'Les meilleures idées de premier rendez-vous',
      excerpt: 'Des idées originales et romantiques pour un premier rendez-vous mémorable.',
      content: 'Le premier rendez-vous est crucial...',
      author: 'Sophie Martin',
      category: 'dating-tips',
      image_url: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg',
      published_at: '2024-01-08T16:45:00Z',
      likes_count: 67,
      comments_count: 23,
      tags: ['rendez-vous', 'romance', 'conseils']
    }
  ]

  useEffect(() => {
    // Pour la démo, on utilise les articles par défaut
    setPosts(defaultPosts)
    setLoading(false)
  }, [])

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'dating-tips': return 'bg-blue-100 text-blue-800'
      case 'success-stories': return 'bg-green-100 text-green-800'
      case 'lifestyle': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'dating-tips': return 'Conseils'
      case 'success-stories': return 'Témoignages'
      case 'lifestyle': return 'Style de vie'
      default: return 'Général'
    }
  }

  const filteredPosts = category === 'all' ? posts : posts.filter(post => post.category === category)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <BookOpen className="h-12 w-12 text-violet-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog & Conseils</h1>
          <p className="text-gray-600">
            Découvrez nos conseils, témoignages et actualités pour réussir en amour
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {[
              { key: 'all', label: 'Tous les articles' },
              { key: 'dating-tips', label: 'Conseils rencontres' },
              { key: 'success-stories', label: 'Témoignages' },
              { key: 'lifestyle', label: 'Style de vie' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCategory(key as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  category === key
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-600 hover:text-violet-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {getCategoryLabel(post.category)}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(post.published_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <User className="h-4 w-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-500 text-sm">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Article Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="relative">
                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 bg-white text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedPost.category)}`}>
                    {getCategoryLabel(selectedPost.category)}
                  </span>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-violet-500">
                      <Heart className="h-5 w-5" />
                      <span>{selectedPost.likes_count}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                      <Share2 className="h-5 w-5" />
                      <span>Partager</span>
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedPost.title}
                </h1>

                <div className="flex items-center text-gray-600 mb-6">
                  <User className="h-5 w-5 mr-2" />
                  <span className="mr-4">Par {selectedPost.author}</span>
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>
                    {formatDistanceToNow(new Date(selectedPost.published_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedPost.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-8">
                  {selectedPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogSection