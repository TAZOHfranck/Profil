import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Message, Profile } from '../lib/supabase'

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