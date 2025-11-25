'use client';

import { useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { NotificationContext } from '@/app/contexts/NotificationContext';

export function useNotification() {
  const { addNotification } = useContext(NotificationContext);
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId =
      typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const userRole =
      typeof window !== 'undefined' ? localStorage.getItem('role') : null;

    if (!token) {
      console.warn('No auth token found, notification system will not connect');
      return;
    }

    console.log('Initializing notifications. User role:', userRole);

    const socketURL =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    socketRef.current = io(socketURL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to notification server');
      isConnectedRef.current = true;

      if (userId) {
        // server side: socket.on('join_room', (userId) => socket.join(`user_${userId}`))
        socketRef.current.emit('join_room', userId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from notification server');
      isConnectedRef.current = false;
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // NOTIFIKASI BARU
    socketRef.current.on('notification:new', (data) => {
      console.log('[NOTIFICATION RECEIVED]', {
        audience: data.audience,
        userRole,
        title: data.title
      });

      const commonPayload = {
        type: 'info',
        title: data.title || 'New Notification',
        body: data.body || '',
        notificationId: data._id,
        createdByName: data.createdByName || null,
        timestamp: data.createdAt,
        isRead: false
      };

      if (data.audience === 'all') {
        addNotification(commonPayload);
      } else if (data.audience === 'parents') {
        if (userRole === 'parent') {
          addNotification(commonPayload);
        }
      } else if (data.audience === 'byUser') {
        // server sudah mengirim hanya ke user yang berhak, jadi langsung tampilkan
        addNotification(commonPayload);
      }
    });

    // Event lama optional
    socketRef.current.on('notification:parents', (data) => {
      if (userRole === 'parent') {
        addNotification({
          type: 'info',
          title: data.title || 'New Notification',
          body: data.body || '',
          notificationId: data._id,
          createdByName: data.createdByName || null,
          timestamp: data.createdAt,
          isRead: false
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [addNotification]);

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current
  };
}
