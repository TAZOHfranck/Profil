import React, { useState, useEffect } from 'react'
import { supabase, Message, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useMessages } from '../contexts/MessagesContext'
import { useLocation } from 'react-router-dom'
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ConversationWithProfile {
  profile: Profile
  lastMessage: Message | null
  unreadCount: number
}

const Messages: React.FC = () => {
  const { user } = useAuth()
  const { conversations, setConversations, selectedConversation, setSelectedConversation } = useMessages()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const userId = params.get('user')
    if (userId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.profile.id === userId)
      if (conversation) {
        setSelectedConversation(conversation)
      }
    }
  }, [location.search, conversations, setSelectedConversation])

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.profile.id)
      markMessagesAsRead(selectedConversation.profile.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Get all unique conversation partners
      const { data: messageData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages by conversation partner
      const conversationMap = new Map<string, ConversationWithProfile>()

      messageData?.forEach(message => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id
        const partnerProfile = message.sender_id === user.id ? message.receiver : message.sender

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            profile: partnerProfile,
            lastMessage: message,
            unreadCount: 0
          })
        }

        // Count unread messages
        if (message.receiver_id === user.id && !message.read) {
          const conversation = conversationMap.get(partnerId)!
          conversation.unreadCount++
        }
      })

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (partnerId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.profile.id,
          content: newMessage,
          message_type: 'text',
          read: false
        })

      if (error) throw error

      setNewMessage('')
      fetchMessages(selectedConversation.profile.id)
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-red-50 md:to-orange-50 pb-0 md:pb-0">
      <div className="w-full h-screen md:w-full md:h-screen px-0 py-0">
        <div className="bg-white shadow-lg overflow-hidden h-screen w-full">
          <div className="flex h-full flex-col md:flex-row">
            {/* Conversations List */}
            <div className={`w-full md:w-[400px] border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-white ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
                <div className="relative bg-white rounded-lg">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une conversation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.profile.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation?.profile.id === conversation.profile.id ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {conversation.profile.photos && conversation.profile.photos.length > 0 ? (
                            <img
                              src={conversation.profile.photos[0]}
                              alt={conversation.profile.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {conversation.profile.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {conversation.profile.is_online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.profile.full_name}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { 
                                  addSuffix: true, 
                                  locale: fr 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#8696a0] md:text-gray-500">
                    Aucune conversation trouvée
                  </div>
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-2 md:p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 md:space-x-3">
                        <button 
                          onClick={() => setSelectedConversation(null)} 
                          className="p-2 text-gray-600 md:hidden"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {selectedConversation.profile.photos && selectedConversation.profile.photos.length > 0 ? (
                              <img
                                src={selectedConversation.profile.photos[0]}
                                alt={selectedConversation.profile.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {selectedConversation.profile.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {selectedConversation.profile.is_online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {selectedConversation.profile.full_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedConversation.profile.is_online ? 'En ligne' : 'Hors ligne'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <Phone className="h-5 w-5 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <Video className="h-5 w-5 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  {/* <div className="p-2 sm:p-4 border-b border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div> */}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-white">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-[0.9375rem]">{message.content}</p>
                          <p className={`text-[0.6875rem] mt-1 ${message.sender_id === user?.id ? 'text-red-100' : 'text-gray-500'}`}>
                            {formatDistanceToNow(new Date(message.created_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  {/* Bloc d'input de message – fixe en bas sur mobile, normal sur desktop */}
<div className="p-2 sm:p-4 border-t border-gray-200 bg-white z-10 md:pb-0 pb-[90px] fixed bottom-0 w-full md:static">
  <div className="flex space-x-2">
    <input
      type="text"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Tapez votre message..."
      className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
    />
    <button
      onClick={sendMessage}
      disabled={!newMessage.trim()}
      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Send className="h-5 w-5" />
    </button>
  </div>
</div>

                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-500">
                      Choisissez une conversation dans la liste pour commencer à discuter
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages