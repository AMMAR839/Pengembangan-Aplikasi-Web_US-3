'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { NotificationList } from '@/app/components/NotificationList';
import './jadwal.css'; // CSS khusus jadwal

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Hari Senin–Jumat
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const dayMap = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5 };

export default function JadwalPage() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState('jadwal');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // ==== STATE ANAK ====
  const [children, setChildren] = useState([]); // daftar anak
  const [selectedChildId, setSelectedChildId] = useState(''); // anak yg dipilih
  const [selectedClass, setSelectedClass] = useState(''); // kelas A/B dari anak

  // ==== STATE JADWAL ====
  const [scheduleData, setScheduleData] = useState([]); // [{ time, activities: [{title, subtitle}] }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedChild = useMemo(
    () => children.find((c) => String(c._id) === String(selectedChildId)),
    [children, selectedChildId]
  );

  // ==== AMBIL LIST ANAK ====
  useEffect(() => {
    async function fetchChildren() {
      try {
        setLoading(true);
        setError('');

        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;
        const role =
          typeof window !== 'undefined'
            ? localStorage.getItem('role')
            : null;

        // Belum login → lempar ke login
        if (!token) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('redirectAfterLogin', '/wali-murid/jadwal');
          }
          router.replace('/login');
          return;
        }

        // Hanya parent / admin
        if (role !== 'parent' && role !== 'admin') {
          setError('Halaman ini hanya untuk wali murid / admin.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/student/my?showNik=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Gagal memuat data anak.');
          setChildren([]);
          setLoading(false);
          return;
        }

        const list = Array.isArray(data) ? data : [];
        setChildren(list);

        if (list.length === 0) {
          setError('Belum ada data anak terdaftar.');
          setLoading(false);
          return;
        }

        // default: anak pertama
        const first = list[0];
        setSelectedChildId(first._id);
        const kelas = first.kelas ;
        setSelectedClass(kelas);

        await fetchScheduleData(kelas);
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data anak.');
        setLoading(false);
      }
    }

    fetchChildren();
  }, [router]);

  // ==== AMBIL JADWAL KELAS (A/B) DARI MONGODB UNTUK SENIN–JUMAT ====
  async function fetchScheduleData(className) {
    try {
      setLoading(true);
      setError('');
      setScheduleData([]);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token')
          : null;

      const allSlots = [];

      // loop hari Senin–Jumat
      for (const day of days) {
        const dayNum = dayMap[day];

        const url = `${API_URL}/api/activities/jadwal?class=${className}&day=${dayNum}`;
        const res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          console.warn('Gagal fetch jadwal untuk hari', day, res.status);
          continue;
        }

        const data = await res.json();

        if (Array.isArray(data.slots) && data.slots.length > 0) {
          allSlots.push(
            ...data.slots.map((slot) => ({
              ...slot,
              dayIndex: days.indexOf(day),
            }))
          );
        }
      }

      if (allSlots.length === 0) {
        setError(`Belum ada kelas.`);
        setScheduleData([]);
        return;
      }

      // Group slot berdasarkan start-end
      const groupedByTime = {};
      allSlots.forEach((slot) => {
        const key = `${slot.start}-${slot.end}`;
        if (!groupedByTime[key]) {
          groupedByTime[key] = {
            start: slot.start,
            end: slot.end,
            activities: Array(days.length).fill(null),
          };
        }
        groupedByTime[key].activities[slot.dayIndex] = {
          title: slot.title,
          subtitle: slot.note || '',
        };
      });

      // urutkan waktu mulai
      const rows = Object.values(groupedByTime).sort((a, b) => {
        const [aH, aM] = a.start.split(':').map(Number);
        const [bH, bM] = b.start.split(':').map(Number);
        return aH * 60 + aM - (bH * 60 + bM);
      });

      const restructured = rows.map((row) => ({
        time: `${row.start.replace(':', '.')} - ${row.end.replace(':', '.')}`,
        activities: row.activities.map((act) => act || { title: '', subtitle: '' }),
      }));

      setScheduleData(restructured);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Tidak dapat memuat jadwal dari server.');
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  }

  // ==== GANTI ANAK DI DROPDOWN ====
  function handleChildChange(e) {
    const id = e.target.value;
    setSelectedChildId(id);

    const child = children.find((c) => String(c._id) === String(id));
    if (child) {
      const kelas = child.kelas ;
      setSelectedClass(kelas);
      fetchScheduleData(kelas);
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    router.replace('/login');
  }

  function handleSubmitFeedback() {
    if (feedback.trim()) {
      submitFeedbackToAPI(feedback.trim());
    }
  }

  async function submitFeedbackToAPI(feedbackText) {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token')
          : null;

      if (!token) {
        console.error('No token found');
        setFeedbackSubmitted(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback: feedbackText }),
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
        {/* LOGO ATAS */}
        <div className="umum-logo sidebar-logo">
          <Image
            src="/images/logo.png"
            alt="Little Garden Logo"
            width={70}
            height={40}
            className="umum-logo-image"
            style={{ height: 'auto' }}
          />
        </div>

        {/* MENU ICON */}
        <div className="umum-nav-left sidebar-content">
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
                  style={{ height: 'auto' }}
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
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Jadwal</span>
            </a>

            <a
              href="/wali-murid/dokumentasi-kbm"
              className={`nav-item ${
                activeNav === 'dokumentasi' ? 'active' : ''
              }`}
              onClick={() => setActiveNav('dokumentasi')}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/dokumentasikbm.png"
                  alt="Dokumentasi KBM"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
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
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Profil Anak</span>
            </a>
          </nav>
        </div>

        {/* BOTTOM ICONS (LOGOUT) */}
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
                style={{ height: 'auto' }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* ========== KONTEN JADWAL ========== */}
      <div className="wali-sub-page wali-jadwal-page">
        <div className="jadwal-header">
          <div className="jadwal-header-left">
            <h1 className="wali-sub-page-title">
              {selectedChild
                ? `Jadwal Harian ${selectedChild.nama}`
                : 'Jadwal Harian'}
            </h1>
            {selectedClass && (
              <p className="jadwal-class-label">Kelas {selectedClass}</p>
            )}
          </div>

          {children.length > 0 && (
            <div className="jadwal-student-select">
              <label htmlFor="child-select">Pilih Anak</label>
              <select
                id="child-select"
                value={selectedChildId}
                onChange={handleChildChange}
              >
                {children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.nama} {child.kelas ? `(Kelas ${child.kelas})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading && (
          <p className="state-text">Memuat data...</p>
        )}

        {error && !loading && (
          <p className="state-text error">{error}</p>
        )}

        {!loading && !error && children.length === 0 && (
          <p className="state-text muted">
            Belum ada data anak terdaftar.
          </p>
        )}

        {/* TABEL JADWAL – GRID MATRIX (baris & kolom pasti rapi) */}
        {!loading && !error && scheduleData.length > 0 && (
          <div className="schedule-container">
            <div className="schedule-grid">
              {/* Header row */}
              <div className="schedule-cell header">Jam</div>
              {days.map((dayName) => (
                <div
                  key={`header-${dayName}`}
                  className="schedule-cell header"
                >
                  {dayName}
                </div>
              ))}

              {/* Data rows */}
              {scheduleData.map((slot, rowIdx) => (
                <React.Fragment key={`row-${rowIdx}`}>
                  {/* Kolom Jam */}
                  <div className="schedule-cell time">{slot.time}</div>

                  {/* Kolom Senin–Jumat */}
                  {days.map((dayName, dayIdx) => {
                    const act = slot.activities[dayIdx];
                    const hasContent = act && act.title;
                    return (
                      <div
                        key={`${dayName}-${rowIdx}`}
                        className={
                          'schedule-cell activity' +
                          (hasContent ? ' filled' : ' empty')
                        }
                      >
                        {hasContent && (
                          <>
                            <div className="activity-title">{act.title}</div>
                            {act.subtitle && (
                              <div className="activity-sub">
                                {act.subtitle}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          children.length > 0 &&
          scheduleData.length === 0 && (
            <p className="state-text muted">
              Tidak ada jadwal yang tersedia untuk kelas {selectedClass}.
            </p>
          )}

        {/* FEEDBACK BAR */}
        <div className="feedback-bar">
          Punya masukan, kritik terkait sekolah, program, atau guru kami? Isi
          form masukan
          <button
            onClick={() => setShowFeedbackModal(true)}
            style={{
              marginLeft: '4px',
              color: '#052826',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
            }}
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

              <h2 className="feedback-modal-title">
                Form Pengisisan Kritik/Saran
              </h2>

              <textarea
                className="feedback-textarea"
                placeholder="Ketikkan saran anda disini...."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={feedbackSubmitted}
              />

              <button
                className={`feedback-submit-btn ${
                  feedbackSubmitted ? 'success' : ''
                }`}
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
