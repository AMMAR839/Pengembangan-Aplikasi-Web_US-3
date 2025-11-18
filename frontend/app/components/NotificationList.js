'use client';

import React, { useContext, useState, useEffect } from 'react';
import { NotificationContext } from '@/app/contexts/NotificationContext';
import styles from './NotificationList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'YOUR_BOT_USERNAME';

export function NotificationList() {
  const {
    storedNotifications,
    removeStoredNotification,
    clearAllStoredNotifications
  } = useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState({ connected: false, loading: true });
  const [showTelegramInput, setShowTelegramInput] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [showTelegramSection, setShowTelegramSection] = useState(false);
  const unreadCount = storedNotifications.length;

  useEffect(() => {
    checkTelegramStatus();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }

    // Poll for status every 5 seconds
    const interval = setInterval(checkTelegramStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkTelegramStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTelegramStatus({ connected: false, loading: false });
        return;
      }

      const res = await fetch(`${API_URL}/telegram/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTelegramStatus({ connected: data.connected, loading: false });
      } else {
        setTelegramStatus({ connected: false, loading: false });
      }
    } catch (err) {
      setTelegramStatus({ connected: false, loading: false });
    }
  };

  const handleTelegramConnect = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/telegram/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telegramUsername })
      });

      if (res.ok) {
        alert('✅ Telegram terhubung!');
        await checkTelegramStatus();
        setShowTelegramInput(false);
        setTelegramUsername('');
      } else {
        const data = await res.json();
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      alert('❌ Gagal menghubungkan Telegram');
    }
  };

  const deepLink = userId ? `https://t.me/${BOT_USERNAME}?start=${userId}` : null;

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
              <div className={styles.titleRow}>
                <h3 className={styles.popupTitle}>Notifications</h3>
                <button
                  className={styles.telegramHeaderBtn}
                  onClick={() => setShowTelegramSection(!showTelegramSection)}
                  title="Toggle Telegram connection"
                  type="button"
                >
                  📱
                </button>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className={styles.popupContent}>
              {/* Telegram Section */}
              {showTelegramSection && (
              <div className={styles.telegramSection}>
                {!telegramStatus.loading && !telegramStatus.connected && (
                  <div className={styles.telegramPrompt}>
                    <div className={styles.telegramIcon}>📱</div>
                    <div className={styles.telegramText}>
                      <strong>Terima notifikasi di Telegram</strong>
                      {!showTelegramInput ? (
                        <div className={styles.telegramButtons}>
                          {deepLink && BOT_USERNAME !== 'YOUR_BOT_USERNAME' && (
                            <a
                              href={deepLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.telegramConnectBtn}
                            >
                              Hubungkan
                            </a>
                          )}
                          <button
                            onClick={() => setShowTelegramInput(true)}
                            className={styles.telegramInputBtn}
                          >
                            Input Username
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleTelegramConnect} className={styles.telegramForm}>
                          <input
                            type="text"
                            value={telegramUsername}
                            onChange={(e) => setTelegramUsername(e.target.value)}
                            placeholder="@username"
                            className={styles.telegramInput}
                            required
                          />
                          <button type="submit" className={styles.telegramSubmitBtn}>✓</button>
                          <button
                            type="button"
                            onClick={() => setShowTelegramInput(false)}
                            className={styles.telegramCancelBtn}
                          >
                            ×
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
                {telegramStatus.connected && (
                  <div className={styles.telegramConnected}>
                    <span className={styles.telegramIcon}>✅</span>
                    <span>Telegram terhubung</span>
                  </div>
                )}
              </div>
              )}

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
