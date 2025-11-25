'use client';

import React, { createContext, useCallback, useState } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // Toast yang muncul sebentar
  const [notifications, setNotifications] = useState([]);
  // Riwayat notifikasi, ditampilkan di bell popup
  const [storedNotifications, setStoredNotifications] = useState([]);

  // Dipakai realtime (Socket.IO) atau manual
  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9);

    const notif = {
      id,
      type: notification.type || 'info',
      title: notification.title || 'Notifikasi',
      body: notification.body || '',
      notificationId: notification.notificationId, // _id dari Mongo (kalau ada)
      audience: notification.audience,
      isRead: notification.isRead,
      createdByName: notification.createdByName || null,
      timestamp: notification.timestamp
        ? new Date(notification.timestamp)
        : new Date()
    };

    // Muncul di toast kecil
    setNotifications((prev) => [notif, ...prev]);

    // Masuk ke riwayat bell
    setStoredNotifications((prev) => [notif, ...prev].slice(0, 50));

    // Auto hilang dari toast setelah 5 detik
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Diisi waktu pertama kali buka app dari /notification/my
  const setInitialStoredNotifications = useCallback((serverNotifications) => {
    if (!Array.isArray(serverNotifications)) return;

    const mapped = serverNotifications.map(function (n) {
      const clientId =
        (n._id && String(n._id)) ||
        (n.notificationId && String(n.notificationId)) ||
        Math.random().toString(36).substr(2, 9);

      return {
        id: clientId,
        notificationId: n._id || n.notificationId,
        title: n.title || 'Notifikasi',
        body: n.body || '',
        type: n.type || 'info',
        audience: n.audience,
        isRead: n.isRead,
        createdByName: n.createdByName || null,
        timestamp: n.createdAt ? new Date(n.createdAt) : new Date()
      };
    });

    setStoredNotifications(mapped);
  }, []);

  // Tandai notifikasi sebagai sudah dibaca di state
  const markStoredNotificationAsRead = useCallback((notificationId) => {
    if (!notificationId) return;

    setStoredNotifications((prev) =>
      prev.map((n) =>
        String(n.notificationId) === String(notificationId)
          ? { ...n, isRead: true }
          : n
      )
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearAllStoredNotifications = useCallback(() => {
    setStoredNotifications([]);
  }, []);

  const removeStoredNotification = useCallback((id) => {
    setStoredNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = {
    notifications,
    storedNotifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearAllStoredNotifications,
    removeStoredNotification,
    setInitialStoredNotifications,
    markStoredNotificationAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
