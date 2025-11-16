'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const scheduleData = [
  {
    time: '09.00 - 09.30',
    activities: [
      { title: 'Senam Pagi', subtitle: 'Senam Anak Sehat' },
      { title: 'Senam Pagi', subtitle: 'Senam SKJ' },
      { title: 'Senam Pagi', subtitle: 'Senam Anak Sehat' }
    ]
  },
  {
    time: '09.30 - 10.30',
    activities: [
      { title: 'Bermain Aktif', subtitle: 'Lempar & Tangkap Bola' },
      { title: 'Bermain Aktif', subtitle: 'Patung & Lilin' },
      { title: 'Bermain Aktif', subtitle: 'Tikus & Kucing' }
    ]
  },
  {
    time: '10.30 - 11.30',
    activities: [
      { title: 'Waktu Cerita', subtitle: 'Kancil & Timun' },
      { title: 'Waktu Cerita', subtitle: 'Malin Kundang' },
      { title: 'Waktu Cerita', subtitle: 'Malin Kundang' }
    ]
  },
  {
    time: '11.30 - 12.00',
    activities: [
      { title: 'Makan Siang', subtitle: '' },
      { title: 'Makan Siang', subtitle: '' },
      { title: 'Makan Siang', subtitle: '' }
    ]
  },
  {
    time: '12.00',
    activities: [
      { title: 'Jam Pulang', subtitle: '' },
      { title: 'Jam Pulang', subtitle: '' },
      { title: 'Jam Pulang', subtitle: '' }
    ]
  }
];

const classes = ['Senin', 'Selasa', 'Rabu'];

export default function JadwalPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('jadwal');
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
            <img src="/logo-bw.png" alt="Little Garden" className="umum-logo-img" />
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

      {/* ========== JADWAL HARIAN ========== */}
      <div className="wali-page">
        <div className="jadwal-header">
          <h1 className="jadwal-title">Jadwal Harian</h1>
        </div>

        <div className="schedule-container">
          <div className="schedule-grid">
            {/* Kolom pertama: Jam */}
            <div className="schedule-day">
              <div className="day-header">Jam</div>
              {scheduleData.map((slot, idx) => (
                <div key={`time-${idx}`} className="time-cell">
                  {slot.time}
                </div>
              ))}
            </div>

            {/* Kolom untuk setiap kelas */}
            {classes.map((className, classIdx) => (
              <div key={className} className="schedule-day">
                <div className="day-header">{className}</div>
                {scheduleData.map((slot, idx) => (
                  <div key={`${className}-${idx}`} className="activity-cell">
                    {slot.activities[classIdx]?.title && (
                      <>
                        <div className="activity-title">
                          {slot.activities[classIdx].title}
                        </div>
                        {slot.activities[classIdx].subtitle && (
                          <div className="activity-sub">
                            {slot.activities[classIdx].subtitle}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
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
