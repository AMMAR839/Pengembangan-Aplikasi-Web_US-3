'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import {useEffect } from 'react';
import { formatTanggalSmart } from '@/utils/date';
import { Montserrat_Underline } from 'next/font/google';

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
  { id: 1, date: 'Senin, 28 Agustus 2025', photo: 'images/dokumentasidummy1.png' },
  { id: 2, date: 'Jumat, 27 Agustus 2025', photo: 'images/dokumentasidummy1.png' }
];

export default function WaliMuridDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const childName = 'Nama Orangtua Murid'; // This should come from auth context

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

const [weather, setWeather] = useState(null);
const [loadingWeather, setLoadingWeather] = useState(true);
const [errorWeather, setErrorWeather] = useState(null);

useEffect(() => {
  async function fetchWeather() {
    try {
      const res = await fetch("http://localhost:5000/api/weather");
      if (!res.ok) throw new Error("Gagal mengambil data cuaca");

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setErrorWeather(err.message);
    } finally {
      setLoadingWeather(false);
    }
  }

  fetchWeather();
}, []);


  return (
    <div className={`umum-page ${showFeedbackModal ? 'blur-bg' : ''}`}>
      {/* ========== SIDEBAR ========== */}
      <aside className="umum-nav sidebar-layout">
        {/* LOGO */}
          <div className="umum-logo sidebar-logo">
            <Image
              src="/images/logo.png"
              alt="Little Garden Logo"
              width={70}
              height={40}
              className="umum-logo-image"
              style={{ height: "auto" }}
            />
          </div>
        <div className="umum-nav-left sidebar-content">

          {/* MENU LIST */}
          <nav className="umum-nav-links sidebar-links">
            <a
              href="/wali-murid/dashboard"
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/dashboard.png"
                  alt="Dashboard"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  data-alt="Dashboard"
                  style={{ height: "auto" }}
                />
              </div>
              <span className="nav-label">Dashboard</span>
            </a>
            <a
              href="/wali-murid/jadwal"
              className={`nav-item ${activeNav === 'jadwal' ? 'active' : ''}`}
              onClick={() => setActiveNav('jadwal')}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Jadwal"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
              <span className="nav-label">Jadwal</span>
            </a>

            <a
              href="/wali-murid/dokumentasi-kbm"
              className={`nav-item ${activeNav === 'dokumentasi' ? 'active' : ''}`}
              onClick={() => setActiveNav('dokumentasi')}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/dokumentasikbm.png"
                  alt="Dokumentasi KBM"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
              <span className="nav-label">Dokumentasi KBM</span>
            </a>

            <a
              href="/wali-murid/profil-anak"
              className={`nav-item ${activeNav === 'profil' ? 'active' : ''}`}
              onClick={() => setActiveNav('profil')}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/profilanak.png"
                  alt="Profil Anak"
                  width={25}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
              <span className="nav-label">Profil Anak</span>
            </a>
          </nav>
        </div>

        {/* BOTTOM ICONS */}
        <div className="umum-nav-right sidebar-actions">
          <button className="umum-icon-btn" type="button">
            <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/profil.png"
                  alt="Profil"
                  width={25}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
          </button>

          <button
            className="umum-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/setting.png"
                  alt="Pengaturan"
                  width={30}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
          </button>
        </div>
      </aside>

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
                <div className="jadwal-more-link" style={{ textAlign: 'right', marginTop: '8px' }}>
                  <Link
                    href="/wali-murid/jadwal"
                    className="jadwal-more"
                    onClick={() => setActiveNav('jadwal')}
                  >
                    Selengkapnya →
                  </Link>
                </div>
            </div>

            {/* Attendance & Announcements Card */}
            <div className="dashboard-card info-card">
              <div className="info-section">
                <div className="info-item attendance">
                  <p className="attendance-label">Presentase Kehadiran</p>
                  <div className="attendance-percentage">97%</div>
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

            {/* Feedback Bar */}
            <div className="feedback-bar">
              Punya masukan, kritik terkait sekolah, program, atau guru kami? Isi form masukan
              <button 
                onClick={() => setShowFeedbackModal(true)}
                style={{ marginLeft: '4px', color: '#052826', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                disini
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            {/* Attendance Chart Card */}
            <div className="chart-card dashboard-card">
                <h2 className="card-title">Perkiraan Cuaca Terdekat</h2>
                {loadingWeather && <p>Mengambil data...</p>}
                {errorWeather && <p style={{color: 'red'}}>{errorWeather}</p>}

                {weather && (
                  <div className="weather-forecast weather-grid">
                    {weather.data_cuaca.map((hari, idx) => {
                      const { relative, fullDate } = formatTanggalSmart(hari.tanggal);
                      return (
                      <div key={idx} className="weather-item">
                      <p>
                      <strong>
                      {formatTanggalSmart(hari.tanggal)}
                      </strong></p>
                      <p>{fullDate}</p>
                      <div className='weather-icon-wrapper'>
                        <img src={`https:${hari.icon}`} alt="icon cuaca" />
                      </div>
                      <p>{hari.kota}</p>
                      <p>{hari.kondisi}</p>
                      <p>{hari.suhu_min} - {hari.suhu_max}</p>
                    </div>
                    );
                    })}
                  </div>
                )}
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
              <div className="documentation-link" style={{ color: '#193745', textDecoration: 'underline', fontWeight: '700'}}>
                <a href="/wali-murid/dokumentasi-kbm">
                  Lihat selengkapnya →
                </a>
              </div>
            </div>
          </div>
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
  );}
