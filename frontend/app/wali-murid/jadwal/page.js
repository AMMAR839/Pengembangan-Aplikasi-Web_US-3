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

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    router.replace('/');
  }

  return (
    <div className="umum-page">
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
          <a href="/wali-murid/feedback" style={{ marginLeft: '4px', color: '#052826', textDecoration: 'underline' }}>
            disini
          </a>
        </div>
      </div>
    </div>
  );
}
