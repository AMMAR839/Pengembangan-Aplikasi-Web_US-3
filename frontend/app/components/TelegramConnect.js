'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'YOUR_BOT_USERNAME';

export default function TelegramConnect() {
  const [status, setStatus] = useState({ connected: false, loading: true });
  const [showManualInput, setShowManualInput] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    checkStatus();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }

    // Poll for status every 5 seconds to detect automatic connections
    const interval = setInterval(() => {
      checkStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus({ connected: false, loading: false });
        return;
      }

      const res = await fetch(`${API_URL}/telegram/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStatus({ connected: data.connected, loading: false });
      } else {
        setStatus({ connected: false, loading: false });
      }
    } catch (err) {
      console.error('Error checking Telegram status:', err);
      setStatus({ connected: false, loading: false });
    }
  };

  const handleManualConnect = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const res = await fetch(`${API_URL}/telegram/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegramChatId: chatId,
          telegramUsername: username
        })
      });

      if (res.ok) {
        alert('✅ Telegram berhasil terhubung!');
        await checkStatus(); // Refresh status
        setShowManualInput(false);
        setChatId('');
        setUsername('');
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error connecting Telegram:', err);
      alert('❌ Gagal menghubungkan Telegram');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Yakin ingin memutuskan koneksi Telegram?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/telegram/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('✅ Telegram terputus');
        setStatus({ connected: false, loading: false });
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
      alert('❌ Gagal memutuskan koneksi');
    }
  };

  const deepLink = userId ? `https://t.me/${BOT_USERNAME}?start=${userId}` : null;

  if (status.loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Telegram Terhubung</p>
              <p className="text-xs text-gray-500">Notifikasi aktif</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition"
          >
            Putuskan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Notifikasi Telegram</h3>
          <p className="text-xs text-gray-500 mb-3">
            Terima notifikasi di Telegram (opsional)
          </p>

          {!showManualInput && !showQR ? (
            <div className="space-y-2">
              {deepLink && BOT_USERNAME !== 'YOUR_BOT_USERNAME' ? (
                <>
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded text-sm font-medium transition"
                  >
                    Hubungkan via Link
                  </a>
                  <button
                    onClick={() => setShowQR(true)}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR Code
                  </button>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                  Bot belum dikonfigurasi
                </div>
              )}
              
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 py-1.5 px-3 rounded text-xs font-medium transition"
              >
                Input Username
              </button>
            </div>
          ) : showQR ? (
            <div className="space-y-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center">
                <p className="text-xs text-gray-600 mb-3 text-center">Scan QR code dengan Telegram</p>
                <div className="bg-white p-2 rounded border-2 border-gray-300">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(deepLink)}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Buka Telegram → Settings → Devices → Scan QR
                </p>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="w-full text-sm text-gray-600 hover:bg-gray-100 py-1.5 rounded transition"
              >
                ← Kembali
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualConnect} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Username Telegram</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username atau username"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Kirim pesan ke bot terlebih dahulu</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-sm font-medium transition"
                >
                  Hubungkan
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
