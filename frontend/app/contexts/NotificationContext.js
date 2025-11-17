'use client';

import React, { createContext, useCallback, useState } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [storedNotifications, setStoredNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notif = {
      id,
      ...notification,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notif, ...prev]);
    
    // Also store in history (keep last 50)
    setStoredNotifications(prev => [notif, ...prev].slice(0, 50));

    // Auto-remove from active after 5 seconds
    const timer = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearAllStoredNotifications = useCallback(() => {
    setStoredNotifications([]);
  }, []);

  const removeStoredNotification = useCallback((id) => {
    setStoredNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    notifications,
    storedNotifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearAllStoredNotifications,
    removeStoredNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
