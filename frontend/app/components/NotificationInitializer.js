'use client';

import { useEffect, useContext, useRef } from 'react';
import { NotificationContext } from '@/app/contexts/NotificationContext';
import { Toast } from './Toast';
import { NotificationList } from './NotificationList';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api';

export function NotificationInitializer() {
  const {
    setInitialStoredNotifications,
    addNotification
  } = useContext(NotificationContext);

  // Menyimpan id notifikasi terakhir yang sudah kita tahu
  const knownIdsRef = useRef(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const controller = new AbortController();

    async function fetchNotifications({ showToastForNew } = { showToastForNew: false }) {
      try {
        const res = await fetch(`${API_URL}/notification/my`, {
          headers: {
            Authorization: 'Bearer ' + token
          },
          signal: controller.signal
        });

        if (!res.ok) {
          console.warn('Gagal mengambil notifikasi:', res.status);
          return;
        }

        const data = await res.json(); // array dari backend

        // --- TOAST UNTUK NOTIFIKASI BARU (opsional) ---
        if (showToastForNew && Array.isArray(data)) {
          const currentIds = new Set(data.map((n) => String(n._id)));

          // cari notifikasi yang belum ada di knownIdsRef
          const newItems = data.filter(
            (n) => !knownIdsRef.current.has(String(n._id))
          );

          newItems.forEach((n) => {
            addNotification({
              type: 'info',
              title: n.title || 'Notifikasi',
              body: n.body || '',
              notificationId: n._id,
              createdByName: n.createdByName || null,
              timestamp: n.createdAt,
              isRead: n.isRead
            });
          });

          knownIdsRef.current = currentIds;
        } else if (Array.isArray(data)) {
          knownIdsRef.current = new Set(data.map((n) => String(n._id)));
        }

        // isi riwayat notifikasi untuk bell/popup
        setInitialStoredNotifications(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetch notifikasi:', err);
      }
    }

    // 1️⃣ Pertama kali load — ambil notifikasi dari DB (tidak perlu toast)
    fetchNotifications({ showToastForNew: false });

    // 2️⃣ Polling: cek notifikasi baru setiap 30 detik
    const intervalId = setInterval(() => {
      fetchNotifications({ showToastForNew: true });
    }, 30000); // 30 detik, bebas kamu kecilkan/besarkan

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [setInitialStoredNotifications, addNotification]);

  return (
    <>
      <Toast />
      <NotificationList />
    </>
  );
}
