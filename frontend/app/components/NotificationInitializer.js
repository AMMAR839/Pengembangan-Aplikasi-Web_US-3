'use client';

import { useNotification } from '@/app/hooks/useNotification';
import { Toast } from './Toast';
import { NotificationList } from './NotificationList';

export function NotificationInitializer() {
  // Initialize the notification system
  useNotification();

  return (
    <>
      <Toast />
      <NotificationList />
    </>
  );
}
