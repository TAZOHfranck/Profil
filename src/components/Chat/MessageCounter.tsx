import React from 'react'
import { useMessages } from '../../contexts/MessagesContext'

interface MessageCounterProps {
  className?: string
}

const MessageCounter: React.FC<MessageCounterProps> = ({ className = '' }) => {
  const { conversations } = useMessages()
  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0)

  if (totalUnreadMessages === 0) return null

  return (
    <span className={`bg-violet-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
      {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
    </span>
  )
}

export default MessageCounter