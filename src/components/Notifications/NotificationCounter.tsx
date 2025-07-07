import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface NotificationCounterProps {
  className?: string
}

const NotificationCounter: React.FC<NotificationCounterProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchUnreadCount()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  if (unreadCount === 0) return null

  return (
    <span className={`bg-violet-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )
}

export default NotificationCounter