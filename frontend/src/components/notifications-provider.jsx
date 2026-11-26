import { useCallback, useMemo, useState } from 'react'
import { initialNotifications } from '../data/notifications.js'
import { NotificationsContext } from './notifications-context.jsx'

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markRead = useCallback((id) => {
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification))
  }, [])

  const markUnread = useCallback((id) => {
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: false } : notification))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }, [])

  const deleteNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const clearRead = useCallback(() => {
    setNotifications((current) => current.filter((notification) => !notification.read))
  }, [])

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markRead,
    markUnread,
    markAllRead,
    deleteNotification,
    clearRead,
  }), [clearRead, deleteNotification, markAllRead, markRead, markUnread, notifications, unreadCount])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
