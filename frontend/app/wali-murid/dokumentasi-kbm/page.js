'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import Image from 'next/image';
import { NotificationList } from '@/app/components/NotificationList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DokumentasiKBMPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dokumentasi');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [documentationData, setDocumentationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocumentation();
  }, []);

  async function fetchDocumentation() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${API_URL}/gallery`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Map gallery data to documentation format
        const formatted = data.map((doc) => ({
          id: doc._id,
          date: new Date(doc.postedAt || doc.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          photo: doc.imageUrl || 'images/dokumentasidummy1.png',
          notes: doc.caption || ''
        }));
        setDocumentationData(formatted);
      } else {
        throw new Error('Failed to fetch documentation');
      }
    } catch (err) {
      console.error('Error fetching documentation:', err);
      setError('Tidak dapat memuat dokumentasi');
      // Use default data if API fails
      setDocumentationData([
        {
          id: 1,
          date: 'Senin, 28 Agustus 2025',
          photo: 'images/dokumentasidummy1.png',
          notes: ''
        },
        {
          id: 2,
          date: 'Rabu, 23 Agustus 2025',
          photo: 'images/dokumentasidummy1.png',
          notes: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

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
      submitFeedbackToAPI(feedback);
    }
  }

  async function submitFeedbackToAPI(feedbackText) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.error('No token found');
        setFeedbackSubmitted(false);
        return;
      }

      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: feedbackText })
      });

      if (!res.ok) throw new Error('Gagal mengirim feedback');

      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
      }, 2000);
    } catch (err) {
      console.error('Feedback API error:', err);
      setFeedback('');
      setShowFeedbackModal(false);
    }
  }

  return (
    <div className={`umum-page ${showFeedbackModal ? 'blur-bg' : ''}`}>
      {/* Notification Bell */}
      <NotificationList />

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
          <button
            className="umum-icon-btn"
            type="button"
            onClick={handleLogout}
            title="Logout"
          >
            <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/logout.png"
                  alt="Logout"
                  width={30}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
          </button>
        </div>
      </aside>

      {/* ========== DOKUMENTASI KBM ========== */}
      <div className="wali-sub-page">
        <div className="dokumentasi-header">
          <h1 className="wali-sub-page-title">Dokumentasi KBM</h1>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '20px' }}>Memuat dokumentasi...</p>}
        {error && <p style={{ textAlign: 'center', color: '#e74c3c', padding: '20px' }}>{error}</p>}

        {!loading && documentationData.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>Belum ada dokumentasi tersedia</p>
        )}

        {!loading && documentationData.length > 0 && (
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
        )}

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

