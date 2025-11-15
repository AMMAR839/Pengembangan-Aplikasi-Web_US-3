'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const documentationData = [
  {
    id: 1,
    date: 'Senin, 28 Agustus 2025',
    photo: '/kbm-photo-1.jpg',
    notes: ''
  },
  {
    id: 2,
    date: 'Rabu, 23 Agustus 2025',
    photo: '/kbm-photo-2.jpg',
    notes: ''
  },
  {
    id: 3,
    date: 'Selasa, 22 Agustus 2025',
    photo: '/kbm-photo-3.jpg',
    notes: ''
  }
];

export default function DokumentasiKBMPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dokumentasi');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
      console.log('Feedback submitted:', feedback);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
      }, 2000);
    }
  }

  return (
    <div className={`umum-page ${showFeedbackModal ? 'blur-bg' : ''}`}>
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

      {/* ========== DOKUMENTASI KBM ========== */}
      <div className="dokumentasi-page">
        <div className="dokumentasi-header">
          <h1 className="dokumentasi-title">Dokumentasi KBM</h1>
        </div>

        <div className="dokumentasi-container">
          <div className="dokumentasi-grid">
            {/* Kolom Tanggal */}
            <div className="dokumentasi-column">
              <div className="dokumentasi-column-header">Tanggal</div>
              <div className="dokumentasi-column-content">
                {documentationData.map((item) => (
                  <div key={item.id} className="dokumentasi-date-card">
                    {item.date}
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Foto Kegiatan */}
            <div className="dokumentasi-column">
              <div className="dokumentasi-column-header">Foto Kegiatan</div>
              <div className="dokumentasi-column-content">
                {documentationData.map((item) => (
                  <div key={item.id} className="dokumentasi-photo-card">
                    <img
                      src={item.photo}
                      alt={`Dokumentasi ${item.date}`}
                      className="dokumentasi-photo"
                    />
                  </div>
                ))}
                <div className="dokumentasi-pagination">•••••</div>
              </div>
            </div>

            {/* Kolom Catatan */}
            <div className="dokumentasi-column">
              <div className="dokumentasi-column-header">Catatan</div>
              <div className="dokumentasi-column-content">
                {documentationData.map((item) => (
                  <div key={item.id} className="dokumentasi-notes-card">
                    {item.notes || '-'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="feedback-bar">
          Punya masukan, kritik terkait sekolah, program, atau guru kami? Isi form masukan
          <button 
            onClick={() => setShowFeedbackModal(true)}
            style={{ marginLeft: '4px', color: '#052826', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            disini
          </button>
        </div>

        {/* FEEDBACK MODAL */}
        {showFeedbackModal && (
          <div className="feedback-modal-overlay">
            <div className="feedback-modal">
              <button
                className="feedback-modal-close"
                onClick={() => setShowFeedbackModal(false)}
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
                disabled={feedbackSubmitted}
              />

              <button
                className={`feedback-submit-btn ${feedbackSubmitted ? 'success' : ''}`}
                onClick={handleSubmitFeedback}
                type="button"
                disabled={feedbackSubmitted}
              >
                {feedbackSubmitted ? '✓ Terkirim!' : 'Kirimkan Saran!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
