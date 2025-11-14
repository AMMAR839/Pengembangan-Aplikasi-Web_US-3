'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const scheduleData = [
  { time: '09.00 - 09.30', senin: 'Senam Pagi', selasa: 'Senam Pagi', rabu: 'Senam Pagi' },
  { time: '09.30 - 10.30', senin: 'Bermain Aktif', selasa: 'Bermain Aktif', rabu: 'Bermain Aktif' },
  { time: '10.30 - 11.30', senin: 'Waktu Cerita', selasa: 'Waktu Cerita', rabu: 'Waktu Cerita' },
  { time: '11.30 - 12.00', senin: 'Makan Siang', selasa: 'Makan Siang', rabu: 'Makan Siang' },
  { time: '12.00', senin: 'Jam Pulang', selasa: 'Jam Pulang', rabu: 'Jam Pulang' }
];

const teachersData = [
  { id: 1, name: 'Ibu Cantika S.Pd.', photo: '/teacher-1.jpg' },
  { id: 2, name: 'Ibu Cantika S.Pd.', photo: '/teacher-2.jpg' },
  { id: 3, name: 'Ibu Cantika S.Pd.', photo: '/teacher-3.jpg' }
];

const documentationData = [
  { id: 1, date: 'Senin, 28 Agustus 2025', photo: '/kbm-photo-1.jpg' },
  { id: 2, date: 'Jumat, 27 Agustus 2025', photo: '/kbm-photo-2.jpg' }
];

export default function WaliMuridDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const childName = 'Nama Orangtua Murid'; // This should come from auth context

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
              Kegiatan
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

      {/* ========== DASHBOARD CONTENT ========== */}
      <div className="dashboard-wali-page">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <h1>Selamat Datang, Bapak/Ibu <span className="greeting-highlight">{childName}!</span></h1>
        </div>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-left">
            {/* Jadwal Harian Card */}
            <div className="dashboard-card jadwal-card">
              <h2 className="card-title">Jadwal Harian</h2>
              <div className="mini-schedule">
                <div className="schedule-table">
                  <div className="schedule-row header">
                    <div className="schedule-col">Jam</div>
                    <div className="schedule-col">Senin</div>
                    <div className="schedule-col">Selasa</div>
                    <div className="schedule-col">Rabu</div>
                  </div>
                  {scheduleData.map((item, idx) => (
                    <div key={idx} className="schedule-row">
                      <div className="schedule-col">{item.time}</div>
                      <div className="schedule-col">{item.senin}</div>
                      <div className="schedule-col">{item.selasa}</div>
                      <div className="schedule-col">{item.rabu}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendance & Announcements Card */}
            <div className="dashboard-card info-card">
              <div className="info-section">
                <div className="info-item attendance">
                  <div className="attendance-percentage">97%</div>
                  <p className="attendance-label">Presentase Kehadiran</p>
                  <small>Hari selengkapnya...</small>
                </div>

                <div className="info-item announcement">
                  <div className="announcement-title">Undangan Pertemuan Ibu Orangtua Murid</div>
                  <small className="announcement-date">2 month yang lalu</small>
                  <p className="announcement-text">Reminder : Pembayaran SPP Bulan November</p>
                  <small className="announcement-date">5 hari yang lalu</small>
                </div>
              </div>
            </div>

            {/* Feedback Bar */}
            <div className="feedback-bar">
              Punya masukan, kritik terkait sekolah, program, atau guru kami? Isi form masukan
              <a href="/wali-murid/feedback" style={{ marginLeft: '4px', color: '#052826', textDecoration: 'underline' }}>
                disini
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            {/* Attendance Chart Card */}
            <div className="dashboard-card chart-card">
              <div className="card-header-with-label">
                <h2 className="card-title">Cuaca Hari Ini</h2>
              </div>
              <div className="chart-placeholder">
                <img src="/weather-chart.jpg" alt="Weather Chart" className="chart-image" />
              </div>
              <div className="chart-info">
                <img src="/attendance-chart.jpg" alt="Attendance Chart" className="attendance-image" />
              </div>
            </div>

            {/* Teachers Card */}
            <div className="dashboard-card teachers-card">
              <h2 className="card-title">Guru Kami</h2>
              <div className="teachers-grid">
                {teachersData.map((teacher) => (
                  <div key={teacher.id} className="teacher-item">
                    <img src={teacher.photo} alt={teacher.name} className="teacher-photo" />
                    <p className="teacher-name">{teacher.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Card */}
            <div className="dashboard-card documentation-card">
              <h2 className="card-title">Dokumentasi KBM</h2>
              <div className="documentation-gallery">
                {documentationData.map((doc) => (
                  <div key={doc.id} className="doc-item">
                    <img src={doc.photo} alt={doc.date} className="doc-photo" />
                    <p className="doc-date">{doc.date}</p>
                  </div>
                ))}
              </div>
              <div className="documentation-link">
                <a href="/wali-murid/dokumentasi-kbm" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Lihat selengkapnya →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
