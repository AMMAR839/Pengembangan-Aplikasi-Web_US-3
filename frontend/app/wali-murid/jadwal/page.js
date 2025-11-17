'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { NotificationList } from '@/app/components/NotificationList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const classes = ['Senin', 'Selasa', 'Rabu'];
const dayMap = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5 };

export default function JadwalPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('jadwal');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScheduleData();
  }, []);

  async function fetchScheduleData() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Fetch schedule for class A (default) for each day
      const allSlots = [];
      for (const day of classes) {
        const dayNum = dayMap[day];
        const res = await fetch(`${API_URL}/activities/jadwal?class=A&day=${dayNum}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Store slots by day
          if (data.slots && data.slots.length > 0) {
            allSlots.push(...data.slots.map((slot, idx) => ({ ...slot, dayIndex: classes.indexOf(day), timeSlot: idx })));
          }
        }
      }

      // If we got data, restructure it; otherwise use default structure
      if (allSlots.length > 0) {
        // Restructure to match UI expectations
        const times = new Set();
        allSlots.forEach(s => times.add(s.start));
        const sortedTimes = Array.from(times).sort();

        const restructured = sortedTimes.map(time => {
          const slotsByTime = allSlots.filter(s => s.start === time);
          return {
            time: time.replace(':', '.') + ' - ' + (slotsByTime[0]?.end || time).replace(':', '.'),
            activities: classes.map(day => {
              const slot = slotsByTime.find(s => s.dayIndex === classes.indexOf(day));
              return {
                title: slot?.title || day,
                subtitle: slot?.note || ''
              };
            })
          };
        });

        setScheduleData(restructured.length > 0 ? restructured : getDefaultSchedule());
      } else {
        setScheduleData(getDefaultSchedule());
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Tidak dapat memuat jadwal, menampilkan jadwal default');
      setScheduleData(getDefaultSchedule());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultSchedule() {
    return [
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
                  alt="Dashboard"
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

      {/* ========== JADWAL HARIAN ========== */}
      <div className="wali-sub-page">
        <div className="jadwal-header">
          <h1 className="wali-sub-page-title">Jadwal Harian</h1>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '20px' }}>Memuat jadwal...</p>}
        {error && <p style={{ textAlign: 'center', color: '#e74c3c', padding: '20px' }}>{error}</p>}

        {!loading && (
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
