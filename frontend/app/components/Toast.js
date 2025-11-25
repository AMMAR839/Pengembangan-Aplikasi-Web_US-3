'use client';

import React, { useContext } from 'react';
import { NotificationContext } from '@/app/contexts/NotificationContext';
import styles from './Toast.module.css';

export function Toast() {
  const { notifications, removeNotification } = useContext(NotificationContext);

  return (
    <div className={styles.toastContainer}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.toast} ${
            styles[`toast-${notification.type || 'info'}`]
          }`}
        >
          <div className={styles.toastContent}>
            <div className={styles.toastIcon}>
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'ℹ'}
            </div>
            <div className={styles.toastMessage}>
              <div className={styles.toastTitle}>{notification.title}</div>
              {notification.body && (
                <div className={styles.toastBody}>{notification.body}</div>
              )}
            </div>
          </div>
          <button
            className={styles.toastClose}
            onClick={() => removeNotification(notification.id)}
            type="button"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
