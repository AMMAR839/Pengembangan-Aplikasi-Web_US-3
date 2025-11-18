'use client';

import { useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { NotificationContext } from '@/app/contexts/NotificationContext';

export function useNotification() {
  const { addNotification } = useContext(NotificationContext);
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    if (!token) {
      console.warn('No auth token found, notification system will not connect');
      return;
    }

    // Connect to Socket.IO server
    const socketURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    socketRef.current = io(socketURL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Connected to notification server');
      isConnectedRef.current = true;
      
      // Join user-specific room if userId exists
      if (userId) {
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

    // Listen for new notifications
    socketRef.current.on('notification:new', (data) => {
      console.log('New notification received:', data);
      
      // Get user role from localStorage
      const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
      
      // Filter notifications based on audience
      if (data.audience === 'all') {
        // All users get this
        addNotification({
          type: 'info',
          title: data.title || 'New Notification',
          body: data.body || '',
          notificationId: data._id
        });
      } else if (data.audience === 'parents' && userRole === 'parent') {
        // Only parents get this
        addNotification({
          type: 'info',
          title: data.title || 'New Notification',
          body: data.body || '',
          notificationId: data._id
        });
      } else if (data.audience === 'byUser') {
        // Specific users only
        addNotification({
          type: 'info',
          title: data.title || 'New Notification',
          body: data.body || '',
          notificationId: data._id
        });
      }
    });

    // Listen for parent-specific notifications (deprecated but kept for compatibility)
    socketRef.current.on('notification:parents', (data) => {
      console.log('Parent notification received:', data);
      const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
      
      if (userRole === 'parent') {
        addNotification({
          type: 'info',
          title: data.title || 'New Notification',
          body: data.body || '',
          notificationId: data._id
        });
      }
    });

    // Cleanup on unmount
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
