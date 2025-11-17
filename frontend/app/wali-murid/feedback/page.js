'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationList } from '@/app/components/NotificationList';

export default function FeedbackPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('jadwal');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    router.replace('/');
  }

  function handleSubmitFeedback() {
    if (feedback.trim()) {
      // Handle feedback submission here (send to backend)
      console.log('Feedback submitted:', feedback);
      setSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFeedback('');
        setSubmitted(false);
      }, 2000);
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

          <textarea
            className="feedback-textarea"
            placeholder="Ketikkan saran anda disini...."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={submitted}
          />

          <button
            className={`feedback-submit-btn ${submitted ? 'success' : ''}`}
            onClick={handleSubmitFeedback}
            type="button"
            disabled={submitted}
          >
            {submitted ? '✓ Terkirim!' : 'Kirimkan Saran!'}
          </button>
        </div>
      </div>
    </div>
  );
}
