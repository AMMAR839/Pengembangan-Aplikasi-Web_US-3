'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NotificationList } from '@/app/components/NotificationList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function FeedbackPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('jadwal');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login'); // halaman login
      }
    }
  }, [router]);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    router.replace('/login');
  }

  async function handleSubmitFeedback() {
    if (!feedback.trim()) {
      setError('Masukan tidak boleh kosong');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        setError('Anda harus login untuk mengirim feedback');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: feedback.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal mengirim feedback');
      }

      setSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setSubmitted(false);
        router.back();
      }, 2000);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'Terjadi kesalahan saat mengirim feedback');
    } finally {
      setLoading(false);
    }
  }

  function handleCloseFeedback() {
    router.back();
  }

  return (
    <div className="umum-page">
      {/* Notification Bell */}
      <NotificationList />

      {/* ========== NAVBAR ========== */}
      <header className="umum-nav">
        <div className="umum-nav-left">
          <div className="umum-logo">
            <span className="umum-logo-flower">🌼</span>
            <span className="umum-logo-text">Little Garden</span>
          </div>

          <nav className="umum-nav-links">
            <a
              href="/wali-murid/dashboard"
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              Dashboard
            </a>

            <a
              href="/wali-murid/jadwal"
              className={`nav-item ${activeNav === 'jadwal' ? 'active' : ''}`}
              onClick={() => setActiveNav('jadwal')}
            >
              Jadwal
            </a>

            <a
              href="/wali-murid/dokumentasi-kbm"
              className={`nav-item ${activeNav === 'dokumentasi' ? 'active' : ''}`}
              onClick={() => setActiveNav('dokumentasi')}
            >
              Dokumentasi KBM
            </a>

            <a
              href="/wali-murid/profil-anak"
              className={`nav-item ${activeNav === 'profil' ? 'active' : ''}`}
              onClick={() => setActiveNav('profil')}
            >
              Profil Anak
            </a>
          </nav>
        </div>

        <div className="umum-nav-right">
          <button className="umum-icon-btn" type="button">
            🔔
          </button>
          <button
            className="umum-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </header>

      {/* ========== FEEDBACK MODAL ========== */}
      <div className="feedback-modal-overlay">
        <div className="feedback-modal">
          <button
            className="feedback-modal-close"
            onClick={handleCloseFeedback}
            type="button"
          >
            ✕
          </button>

          <h2 className="feedback-modal-title">Form Pengisisan Kritik/Saran</h2>

          {error && <div style={{ color: '#e74c3c', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}
          {submitted && <div style={{ color: '#2ecc71', marginBottom: '12px', fontSize: '14px' }}>✓ Feedback terkirim!</div>}

          <textarea
            className="feedback-textarea"
            placeholder="Ketikkan saran anda disini...."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={submitted || loading}
          />

          <button
            className={`feedback-submit-btn ${submitted ? 'success' : ''}`}
            onClick={handleSubmitFeedback}
            type="button"
            disabled={submitted || loading}
          >
            {loading ? 'Mengirim...' : submitted ? '✓ Terkirim!' : 'Kirimkan Saran!'}
          </button>
        </div>
      </div>
    </div>
  );
}
