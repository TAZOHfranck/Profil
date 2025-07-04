import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Calendar, MapPin, Users, Clock, Heart, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CommunityEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  max_participants: number
  current_participants: number
  category: string
  image_url?: string
  organizer_id: string
  organizer_name: string
  price: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

const CommunityEvents: React.FC = () => {
  const { user, profile } = useAuth()
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [myEvents, setMyEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'my-events'>('all')

  useEffect(() => {
    fetchEvents()
    if (user) {
      fetchMyEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          profiles!community_events_organizer_id_fkey(full_name)
        `)
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error

      const eventsWithOrganizer = data.map(event => ({
        ...event,
        organizer_name: event.profiles?.full_name || 'Organisateur'
      }))

      setEvents(eventsWithOrganizer)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyEvents = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id)

      if (error) throw error
      setMyEvents(data.map(p => p.event_id))
    } catch (error) {
      console.error('Error fetching my events:', error)
    }
  }

  const joinEvent = async (eventId: string) => {
    if (!user) return

    try {
      await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed'
        })

      // Incrémenter le nombre de participants
      await supabase.rpc('increment_event_participants', { event_id: eventId })

      setMyEvents([...myEvents, eventId])
      fetchEvents() // Refresh pour mettre à jour le compteur
    } catch (error) {
      console.error('Error joining event:', error)
    }
  }

  const leaveEvent = async (eventId: string) => {
    if (!user) return

    try {
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)

      // Décrémenter le nombre de participants
      await supabase.rpc('decrement_event_participants', { event_id: eventId })

      setMyEvents(myEvents.filter(id => id !== eventId))
      fetchEvents()
    } catch (error) {
      console.error('Error leaving event:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return <Users className="h-5 w-5" />
      case 'romantic': return <Heart className="h-5 w-5" />
      case 'cultural': return <Star className="h-5 w-5" />
      default: return <Calendar className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-800'
      case 'romantic': return 'bg-red-100 text-red-800'
      case 'cultural': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'my-events') return myEvents.includes(event.id)
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Événements communautaires</h1>
          <p className="text-gray-600">
            Participez à des événements et rencontrez des personnes partageant vos intérêts
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {[
              { key: 'all', label: 'Tous les événements' },
              { key: 'upcoming', label: 'À venir' },
              { key: 'my-events', label: 'Mes événements' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === key
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getCategoryColor(event.category)}`}>
                    {getCategoryIcon(event.category)}
                    <span className="capitalize">{event.category}</span>
                  </span>
                  {event.price > 0 && (
                    <span className="text-green-600 font-semibold">
                      {event.price}€
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.current_participants}/{event.max_participants} participants</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Par {event.organizer_name}
                  </span>
                  
                  {myEvents.includes(event.id) ? (
                    <button
                      onClick={() => leaveEvent(event.id)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Se désinscrire
                    </button>
                  ) : (
                    <button
                      onClick={() => joinEvent(event.id)}
                      disabled={event.current_participants >= event.max_participants}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {event.current_participants >= event.max_participants ? 'Complet' : 'Participer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-500">
              {filter === 'my-events' 
                ? 'Vous ne participez à aucun événement pour le moment'
                : 'Aucun événement disponible actuellement'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityEvents