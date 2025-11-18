'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { NotificationList } from '@/app/components/NotificationList';
import './dashboard-wali.css';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ;

const previewDays = ['Senin', 'Selasa', 'Rabu'];
const dayMap = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5 };

// Guru boleh dummy dulu
const teachersData = [
  {
    id: 1,
    name: 'Dr. Bimo Sunarfri Hantono, S.T., M.Eng.',
    photo: '/images/teacher-1.jpg',
  },
  {
    id: 2,
    name: 'Benaya Imanuela',
    photo: '/images/teacher-2.jpg',
  },
  {
    id: 3,
    name: 'Petrus Aria Chevalier Rambing',
    photo: '/images/teacher-3.jpg',
  },
];

export default function WaliMuridDashboard() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState('dashboard');

  const [parentName, setParentName] = useState('');
  const [children, setChildren] = useState([]);
  const [primaryChild, setPrimaryChild] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');

  const [shortSchedule, setShortSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState('');

  const [attendancePercentage, setAttendancePercentage] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [errorWeather, setErrorWeather] = useState('');

  const [documentationData, setDocumentationData] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [pageError, setPageError] = useState('');

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // ====== JADWAL SINGKAT (Senin–Rabu) dari MongoDB ======
  async function fetchShortSchedule(kelas, token) {
    try {
      setLoadingSchedule(true);
      setScheduleError('');
      setShortSchedule([]);

      if (!kelas) {
        setScheduleError('Jadwal belum tersedia untuk kelas -.');
        return;
      }

      const allSlots = [];

      for (const dayName of previewDays) {
        const dayNum = dayMap[dayName];

        const res = await fetch(
          `${API_URL}/api/activities/jadwal?class=${encodeURIComponent(
            kelas
          )}&day=${dayNum}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.warn(
            'Gagal mengambil jadwal untuk hari',
            dayName,
            res.status
          );
          continue;
        }

        const data = await res.json();
        if (Array.isArray(data.slots)) {
          const dayIndex = previewDays.indexOf(dayName);
          data.slots.forEach((slot) => {
            allSlots.push({ ...slot, dayIndex });
          });
        }
      }

      if (allSlots.length === 0) {
        setScheduleError(`Jadwal belum tersedia untuk kelas ${kelas}.`);
        return;
      }

      // group by jam start-end
      const grouped = {};
      allSlots.forEach((slot) => {
        const key = `${slot.start}-${slot.end}`;
        if (!grouped[key]) {
          grouped[key] = {
            start: slot.start,
            end: slot.end,
            activities: Array(previewDays.length).fill(''),
          };
        }
        grouped[key].activities[slot.dayIndex] = slot.title || '';
      });

      const rows = Object.values(grouped).sort((a, b) => {
        const [ah, am] = (a.start || '00:00').split(':').map(Number);
        const [bh, bm] = (b.start || '00:00').split(':').map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });

      const finalRows = rows.map((row) => ({
        time: `${(row.start || '').slice(0, 5).replace(
          ':',
          '.'
        )} - ${(row.end || '').slice(0, 5).replace(':', '.')}`,
        activities: row.activities.map((t) => t || ''),
      }));

      setShortSchedule(finalRows);
    } catch (err) {
      console.error('fetchShortSchedule error:', err);
      setScheduleError('Tidak dapat memuat jadwal dari server.');
    } finally {
      setLoadingSchedule(false);
    }
  }

  // ====== PRESENSI dari backend ======
  async function fetchAttendance(token) {
    try {
      setLoadingAttendance(true);
      setAttendancePercentage(null);

      const res = await fetch(`${API_URL}/api/attendance/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn('Attendance endpoint error:', res.status);
        setAttendancePercentage(0);
        return;
      }

      const data = await res.json();

      if (data.totalDays && data.presentDays) {
        const percentage = Math.round(
          (data.presentDays / data.totalDays) * 100
        );
        setAttendancePercentage(percentage);
      } else if (typeof data.percentage === 'number') {
        setAttendancePercentage(Math.round(data.percentage));
      } else {
        setAttendancePercentage(0);
      }
    } catch (err) {
      console.error('fetchAttendance error:', err);
      setAttendancePercentage(0);
    } finally {
      setLoadingAttendance(false);
    }
  }

  // ====== CUACA ======
  async function fetchWeather() {
    try {
      setLoadingWeather(true);
      setErrorWeather('');
      setWeather(null);

      const res = await fetch(`${API_URL}/api/weather`);

      if (!res.ok) {
        throw new Error('Gagal mengambil data cuaca');
      }

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setErrorWeather(
        err?.message || 'Gagal mengambil data cuaca, gunakan perkiraan umum.'
      );

      const today = new Date();
      const formatDate = (offset) => {
        const d = new Date(today.getTime() + offset * 86400000);
        return d.toISOString().split('T')[0];
      };

      // fallback
      setWeather({
        lokasi: 'Yogyakarta',
        data_cuaca: [
          {
            tanggal: formatDate(0),
            kota: 'Yogyakarta',
            suhu_max: '32°C',
            suhu_min: '24°C',
            kondisi: 'Berawan',
            icon:
              'https://cdn.weatherapi.com/weather/128x128/day/119.png',
            persentase_hujan: '20%',
          },
          {
            tanggal: formatDate(1),
            kota: 'Yogyakarta',
            suhu_max: '31°C',
            suhu_min: '23°C',
            kondisi: 'Cerah',
            icon:
              'https://cdn.weatherapi.com/weather/128x128/day/113.png',
            persentase_hujan: '0%',
          },
        ],
      });
    } finally {
      setLoadingWeather(false);
    }
  }

  // ====== DOKUMENTASI KBM (preview dari /api/activities/daily-by-student) ======
  async function fetchDocumentation(studentId, token) {
    try {
      setLoadingDocs(true);
      setDocumentationData([]);

      if (!studentId) return;

      const res = await fetch(
        `${API_URL}/api/activities/daily-by-student?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.warn(
          'Dashboard: daily-by-student tidak OK',
          res.status
        );
        return;
      }

      const data = await res.json();

      const rawDate = data.date ? new Date(data.date) : null;
      let dateLabel = 'Tanggal tidak diketahui';
      if (rawDate && !isNaN(rawDate.getTime())) {
        dateLabel = rawDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }

      const slots = Array.isArray(data.slots) ? data.slots : [];
      const items = [];

      for (const slot of slots) {
        if (Array.isArray(slot.photos) && slot.photos.length > 0) {
          items.push({
            id: slot._id,
            date: dateLabel,
            photo: slot.photos[0].url,
          });
        }
        if (items.length >= 2) break; // cukup 2 foto preview
      }

      setDocumentationData(items);
    } catch (err) {
      console.error('Error fetchDocumentation (dashboard):', err);
      setDocumentationData([]);
    } finally {
      setLoadingDocs(false);
    }
  }

  // ====== INIT DASHBOARD ======
  useEffect(() => {
    async function init() {
      try {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');

        if (!token) {
          localStorage.setItem(
            'redirectAfterLogin',
            '/wali-murid/dashboard'
          );
          router.replace('/login');
          return;
        }

        setParentName(username || '');

        if (role !== 'parent' && role !== 'admin') {
          setPageError('Halaman ini hanya untuk wali murid / admin.');
          return;
        }

        const res = await fetch(`${API_URL}/api/student/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setPageError(data.message || 'Gagal memuat data anak.');
          return;
        }

        const list = Array.isArray(data) ? data : [];
        setChildren(list);

        if (list.length === 0) {
          setPageError('Belum ada data anak terdaftar.');
          return;
        }

        const first = list[0];
        setPrimaryChild(first);
        const kelas = first.kelas || 'A';
        setSelectedClass(kelas);

        await Promise.all([
          fetchShortSchedule(kelas, token),
          fetchAttendance(token),
          fetchWeather(),
          fetchDocumentation(first._id, token),
        ]);
      } catch (err) {
        console.error('Init dashboard error:', err);
        setPageError('Terjadi kesalahan saat memuat dashboard.');
      }
    }

    init();
  }, [router]);

  // ====== Logout ======
  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    router.replace('/');
  }

  // ====== Feedback ======
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
      {/* Notification bell */}
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
            style={{ height: 'auto' }}
          />
        </div>

        {/* MENU LIST */}
        <div className="umum-nav-left sidebar-content">
          <nav className="umum-nav-links sidebar-links">
            <a
              href="/wali-murid/dashboard"
              className={`nav-item ${
                activeNav === 'dashboard' ? 'active' : ''
              }`}
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
              className={`nav-item ${
                activeNav === 'jadwal' ? 'active' : ''
              }`}
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
              className={`nav-item ${
                activeNav === 'profil' ? 'active' : ''
              }`}
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

        {/* LOGOUT */}
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

      {/* ========== DASHBOARD CONTENT ========== */}
      <div className="dashboard-wali-page">
        <div className="dashboard-greeting">
          <p className="dashboard-subtitle">Dashboard Wali Murid</p>
          <h1>
            Selamat Datang, Bapak/Ibu{' '}
            <span className="greeting-highlight">
              {parentName || 'Orangtua Murid'}
            </span>
          </h1>
          {primaryChild && (
            <p className="dashboard-child-label">
              Memantau perkembangan{' '}
              <strong>{primaryChild.nama}</strong>
              {primaryChild.kelas && (
                <>
                  {' '}
                  • Kelas <strong>{primaryChild.kelas}</strong>
                </>
              )}
            </p>
          )}
          {pageError && (
            <p className="dashboard-error-text">{pageError}</p>
          )}
        </div>

        {!pageError && (
          <div className="dashboard-grid">
            {/* LEFT COLUMN */}
            <div className="dashboard-left">
              {/* Jadwal Harian Singkat */}
              <div className="dashboard-card jadwal-card">
                <div className="dashboard-card-header">
                  <h2 className="card-title">Jadwal Harian Singkat</h2>
                  {selectedClass && (
                    <span className="card-chip">
                      Kelas {selectedClass}
                    </span>
                  )}
                </div>

                {loadingSchedule ? (
                  <p className="card-muted-text">Memuat jadwal...</p>
                ) : shortSchedule.length === 0 ? (
                  <p className="card-muted-text">
                    {scheduleError ||
                      `Jadwal belum tersedia untuk kelas ${
                        selectedClass || '-'
                      }.`}
                  </p>
                ) : (
                  <div className="mini-schedule">
                    <div className="schedule-table">
                      <div className="schedule-row header">
                        <div className="schedule-col">Jam</div>
                        {previewDays.map((day) => (
                          <div
                            key={day}
                            className="schedule-col"
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      {shortSchedule.map((row, idx) => (
                        <div key={idx} className="schedule-row">
                          <div className="schedule-col">
                            {row.time}
                          </div>
                          {row.activities.map((act, i) => (
                            <div
                              key={i}
                              className="schedule-col"
                            >
                              {act || '-'}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="jadwal-more-link">
                  <Link
                    href="/wali-murid/jadwal"
                    className="jadwal-more"
                    onClick={() => setActiveNav('jadwal')}
                  >
                    Lihat jadwal lengkap →
                  </Link>
                </div>
              </div>

              {/* Kehadiran & Informasi */}
              <div className="dashboard-card info-card">
                <h2 className="card-title">
                  Kehadiran & Informasi Penting
                </h2>
                <div className="info-section">
                  <div className="info-item attendance">
                    <p className="attendance-label">
                      Persentase Kehadiran
                    </p>
                    <div className="attendance-percentage">
                      {loadingAttendance ||
                      attendancePercentage === null
                        ? '–'
                        : `${attendancePercentage}%`}
                    </div>
                    {!loadingAttendance && (
                      <p className="card-muted-text">
                        Data diambil dari riwayat absensi anak
                        Anda.
                      </p>
                    )}
                  </div>

                  <div className="info-item announcement">
                    <div className="announcement-title">
                      Informasi Penting
                    </div>
                    <small className="announcement-date">
                    </small>
                    <p className="announcement-text">
                      Reminder: Cek jadwal harian dan dokumentasi
                      KBM secara berkala untuk memantau
                      perkembangan anak.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guru Kelas */}
              <div className="dashboard-card teachers-card">
                <h2 className="card-title">Guru Kelas</h2>
                {teachersData.length === 0 ? (
                  <p className="card-muted-text">
                    Data guru belum tersedia untuk kelas{' '}
                    {selectedClass || '-'}.
                  </p>
                ) : (
                  <div className="teachers-grid">
                    {teachersData.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="teacher-item"
                      >
                        <img
                          src={teacher.photo}
                          alt={teacher.name}
                          className="teacher-photo"
                        />
                        <p className="teacher-name">
                          {teacher.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Bar */}
              <div className="feedback-bar">
                Punya masukan, kritik terkait sekolah, program,
                atau guru kami? Isi form masukan
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
            </div>

            {/* RIGHT COLUMN */}
            <div className="dashboard-right">
              {/* Cuaca */}
              <div className="dashboard-card chart-card">
                <h2 className="card-title">
                  Perkiraan Cuaca Terdekat
                </h2>
                {loadingWeather && (
                  <p className="card-muted-text">
                    Mengambil data cuaca...
                  </p>
                )}
                {!loadingWeather && errorWeather && (
                  <p className="card-muted-text">
                    {errorWeather}
                  </p>
                )}
                {weather && weather.data_cuaca && (
                  <div className="weather-grid">
                    {weather.data_cuaca.map((hari, idx) => (
                      <div key={idx} className="weather-item">
                        <p>
                          <strong>{hari.tanggal}</strong>
                        </p>
                        <div className="weather-icon-wrapper">
                          <img
                            src={hari.icon}
                            alt="Ikon cuaca"
                          />
                        </div>
                        <p>{hari.kota}</p>
                        <p>{hari.kondisi}</p>
                        <p>
                          {hari.suhu_min} - {hari.suhu_max}
                        </p>
                        {hari.persentase_hujan && (
                          <p>
                            Peluang hujan:{' '}
                            {hari.persentase_hujan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dokumentasi KBM */}
              <div className="dashboard-card documentation-card">
                <div className="dashboard-card-header">
                  <h2 className="card-title">Dokumentasi KBM</h2>
                  {primaryChild && (
                    <span className="card-chip">
                      {primaryChild.nama}{' '}
                      {primaryChild.kelas
                        ? `• Kelas ${primaryChild.kelas}`
                        : ''}
                    </span>
                  )}
                </div>

                {loadingDocs ? (
                  <p className="card-muted-text">
                    Memuat dokumentasi hari ini...
                  </p>
                ) : documentationData.length === 0 ? (
                  <p className="card-muted-text">
                    Dokumentasi belum tersedia untuk hari ini.
                  </p>
                ) : (
                  <div className="documentation-gallery">
                    {documentationData.map((doc) => (
                      <div key={doc.id} className="doc-item">
                        <div className="doc-photo-wrapper">
                          <img
                            src={doc.photo}
                            alt={doc.date}
                            className="doc-photo"
                          />
                        </div>
                        <p className="doc-date">
                          {doc.date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="documentation-link">
                  <a href="/wali-murid/dokumentasi-kbm">
                    Lihat dokumentasi lengkap →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {feedbackSubmitted
                  ? '✓ Terkirim!'
                  : 'Kirimkan Saran!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
