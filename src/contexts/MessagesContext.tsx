import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Message, Profile } from '../lib/supabase'
import { supabase } from '../lib/supabase'

interface ConversationWithProfile {
  profile: Profile
  lastMessage: Message | null
  unreadCount: number
}

interface MessagesContextType {
  selectedConversation: ConversationWithProfile | null
  setSelectedConversation: (conversation: ConversationWithProfile | null) => void
  conversations: ConversationWithProfile[]
  setConversations: (conversations: ConversationWithProfile[]) => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export const useMessages = () => {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}

interface MessagesProviderProps {
  children: ReactNode
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ children }) => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfile | null>(null)
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([])

  useEffect(() => {
    // Abonnement aux changements de messages en temps réel
    const subscription = supabase
      .channel('messages_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload) => {
          // Mise à jour des conversations en fonction des changements
          if (payload.new) {
            const updatedMessage = payload.new as Message
            setConversations(prevConversations => {
              return prevConversations.map(conv => {
                if (conv.profile.id === updatedMessage.sender_id || 
                    conv.profile.id === updatedMessage.receiver_id) {
                  return {
                    ...conv,
                    lastMessage: updatedMessage,
                    unreadCount: conv.profile.id === updatedMessage.receiver_id ? 
                      conv.unreadCount + 1 : conv.unreadCount
                  }
                }
                return conv
              })
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <MessagesContext.Provider
      value={{
        selectedConversation,
        setSelectedConversation,
        conversations,
        setConversations
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}