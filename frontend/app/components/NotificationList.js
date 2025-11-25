'use client';

import React, { useContext, useState, useMemo } from 'react';
import { NotificationContext } from '@/app/contexts/NotificationContext';
import styles from './NotificationList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api';

export function NotificationList() {
  const {
    storedNotifications,
    removeStoredNotification,
    clearAllStoredNotifications,
    markStoredNotificationAsRead
  } = useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Badge jumlah notifikasi (utama: unread)
  const badgeCount = useMemo(() => {
    if (!storedNotifications || !storedNotifications.length) return 0;

    const unread = storedNotifications.filter((n) => !n.isRead).length;
    return unread || storedNotifications.length;
  }, [storedNotifications]);

  function handleToggleOpen() {
    setIsOpen((prev) => !prev);

    if (!isOpen && storedNotifications && storedNotifications.length > 0) {
      setSelectedNotification(storedNotifications[0]);
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleDeleteItem(id) {
    removeStoredNotification(id);
  }

  function handleClearAll() {
    clearAllStoredNotifications();
    setSelectedNotification(null);
  }

  function getIconForType(type) {
    if (type === 'success') return '✓';
    if (type === 'error') return '✕';
    if (type === 'warning') return '⚠';
    return 'ℹ';
  }

  // Klik item → tampilkan detail + tandai sudah dibaca
  async function handleSelectItem(n) {
    setSelectedNotification(n);

    if (!n.notificationId || n.isRead) {
      return;
    }

    // update di frontend
    markStoredNotificationAsRead(n.notificationId);

    // update di backend
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      await fetch(`${API_URL}/notification/${n.notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Gagal menandai notifikasi sebagai dibaca:', err);
    }
  }

  return (
    <>
      {/* Tombol bell */}
      <button
        type="button"
        className={styles.bellButton}
        onClick={handleToggleOpen}
        aria-label="Buka notifikasi"
      >
        <span className={styles.bellIcon}>🔔</span>
        {badgeCount > 0 && (
          <div className={styles.badge}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          {/* backdrop */}
          <div className={styles.backdrop} onClick={handleClose} />

          {/* popup utama */}
          <div className={styles.popup}>
            {/* header */}
            <div className={styles.popupHeader}>
              <div className={styles.titleRow}>
                <span className={styles.popupTitle}>Notifikasi</span>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Tutup notifikasi"
              >
                ×
              </button>
            </div>

            {/* isi */}
            <div className={styles.popupContent}>
              {/* DETAIL */}
              {selectedNotification && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#ffffff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#111827',
                      marginBottom: 6
                    }}
                  >
                    {selectedNotification.title}
                  </div>

                  {selectedNotification.body && (
                    <div
                      style={{
                        fontSize: 13,
                        color: '#4b5563',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        marginBottom: 6
                      }}
                    >
                      {selectedNotification.body}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <span>
                      {selectedNotification.timestamp &&
                      selectedNotification.timestamp.toLocaleString
                        ? selectedNotification.timestamp.toLocaleString('id-ID')
                        : new Date(
                            selectedNotification.timestamp
                          ).toLocaleString('id-ID')}
                    </span>

                    {selectedNotification.createdByName && (
                      <span>
                        Dibuat oleh{' '}
                        <strong>{selectedNotification.createdByName}</strong>
                      </span>
                    )}

                    <span>
                      {selectedNotification.isRead
                        ? 'Sudah dibaca'
                        : 'Belum dibaca'}
                    </span>
                  </div>
                </div>
              )}

              {/* LIST */}
              {(!storedNotifications || storedNotifications.length === 0) ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔔</div>
                  <p className={styles.emptyText}>Belum ada notifikasi.</p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {storedNotifications.map((n) => {
                    const type = n.type || 'info';
                    const itemClassName = [
                      styles.notificationItem,
                      styles['item-' + type]
                    ]
                      .filter(Boolean)
                      .join(' ');

                    const isRead = !!n.isRead;

                    return (
                      <div
                        key={n.id}
                        className={itemClassName}
                        onClick={() => handleSelectItem(n)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.itemIcon}>
                          {getIconForType(type)}
                        </div>

                        <div className={styles.itemContent}>
                          <div
                            className={styles.itemTitle}
                            style={
                              isRead
                                ? {
                                    color: '#9ca3af',
                                    fontWeight: 500
                                  }
                                : undefined
                            }
                          >
                            {n.title}
                          </div>

                          {n.body && (
                            <div className={styles.itemBody}>{n.body}</div>
                          )}

                          <div className={styles.itemTime}>
                            {n.timestamp && n.timestamp.toLocaleString
                              ? n.timestamp.toLocaleString('id-ID')
                              : new Date(n.timestamp).toLocaleString('id-ID')}
                            {n.createdByName && (
                              <> • oleh {n.createdByName}</>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={styles.itemDelete}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(n.id);
                          }}
                          aria-label="Hapus notifikasi"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* footer */}
            <div className={styles.popupFooter}>
              <button
                type="button"
                className={styles.clearAllButton}
                onClick={handleClearAll}
                disabled={
                  !storedNotifications || storedNotifications.length === 0
                }
              >
                Bersihkan semua notifikasi
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
