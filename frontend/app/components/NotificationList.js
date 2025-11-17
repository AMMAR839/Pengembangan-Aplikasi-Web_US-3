'use client';

import React, { useContext, useState } from 'react';
import { NotificationContext } from '@/app/contexts/NotificationContext';
import styles from './NotificationList.module.css';

export function NotificationList() {
  const {
    storedNotifications,
    removeStoredNotification,
    clearAllStoredNotifications
  } = useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = storedNotifications.length;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Notification List Popup */}
      {isOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3 className={styles.popupTitle}>Notifications</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className={styles.popupContent}>
              {storedNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📭</div>
                  <p className={styles.emptyText}>No notifications yet</p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {storedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${styles[`item-${notification.type || 'info'}`]}`}
                    >
                      <div className={styles.itemIcon}>
                        {getIcon(notification.type)}
                      </div>
                      <div className={styles.itemContent}>
                        <div className={styles.itemTitle}>
                          {notification.title}
                        </div>
                        {notification.body && (
                          <div className={styles.itemBody}>
                            {notification.body}
                          </div>
                        )}
                        <div className={styles.itemTime}>
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                      <button
                        className={styles.itemDelete}
                        onClick={() => removeStoredNotification(notification.id)}
                        type="button"
                        title="Delete notification"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {storedNotifications.length > 0 && (
              <div className={styles.popupFooter}>
                <button
                  className={styles.clearAllButton}
                  onClick={clearAllStoredNotifications}
                  type="button"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
