'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

      {/* ========== PROFIL ANAK ========== */}
      <div className="profil-page">
        <div className="profil-header">
          <h1 className="profil-title">Profil Anak</h1>
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
          <a href="/wali-murid/feedback" style={{ marginLeft: '4px', color: '#052826', textDecoration: 'underline' }}>
            disini
          </a>
        </div>
      </div>
    </div>
  );
}
