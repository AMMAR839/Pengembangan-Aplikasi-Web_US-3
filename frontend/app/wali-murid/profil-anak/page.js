'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

const childrenData = [
  {
    id: 1,
    nama: 'Ahmad Rizki',
    tanggalLahir: '15 Januari 2021',
    alamat: 'Jl. Merdeka No. 45, Jakarta',
    golonganDarah: 'O+',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    status: 'Aktif'
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    tanggalLahir: '22 Maret 2021',
    alamat: 'Jl. Gatot Subroto No. 12, Jakarta',
    golonganDarah: 'A-',
    jenisKelamin: 'Perempuan',
    agama: 'Islam',
    status: 'Aktif'
  }
];

export default function ProfilAnakPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('profil');
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
                  alt="Little Garden Logo"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
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

      {/* ========== PROFIL ANAK ========== */}
      <div className="wali-sub-page">
        <div className="profil-header">
          <h1 className="wali-sub-page-title">Profil Anak</h1>
        </div>

        <div className="profil-container">
          {childrenData.map((child) => (
            <div key={child.id} className="profil-card">
              {/* Photo Section */}
              <div className="profil-photo-section">
                <img
                  src="/child-photo.jpg"
                  alt={child.nama}
                  className="profil-photo"
                />
              </div>

              {/* Data Section */}
              <div className="profil-data-section">
                <div className="profil-field">
                  <label className="profil-label">Nama</label>
                  <div className="profil-value">{child.nama}</div>
                </div>

                <div className="profil-field">
                  <label className="profil-label">Tanggal Lahir</label>
                  <div className="profil-value">{child.tanggalLahir}</div>
                </div>

                <div className="profil-field">
                  <label className="profil-label">Alamat</label>
                  <div className="profil-value">{child.alamat}</div>
                </div>

                <div className="profil-field">
                  <label className="profil-label">Golongan Darah</label>
                  <div className="profil-value">{child.golonganDarah}</div>
                </div>

                <div className="profil-field">
                  <label className="profil-label">Jenis Kelamin</label>
                  <div className="profil-value">{child.jenisKelamin}</div>
                </div>

                <div className="profil-field">
                  <label className="profil-label">Agama</label>
                  <div className="profil-value">{child.agama}</div>
                </div>

                <div className="profil-field">
                  <label className="profil-label">Status</label>
                  <div className="profil-value">{child.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="profil-change-note">
          Ingin melakukan perubahan? Hubungi admin sekolah
          <a href="#" style={{ marginLeft: '4px', color: '#052826', textDecoration: 'underline' }}>
            disini
          </a>
          .
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
