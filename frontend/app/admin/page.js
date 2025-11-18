'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const API_URL =process.env.NEXT_PUBLIC_API_URL + '/api';
const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function AdminDashboardNew() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifAudience, setNotifAudience] = useState('all'); // all | parents | byUser
  const [notifUsernames, setNotifUsernames] = useState(''); // untuk audience=byUser
  const [loadingNotif, setLoadingNotif] = useState(false);

  // Documentation states
  const [docs, setDocs] = useState([]);
  const [docDate, setDocDate] = useState('');
  const [docCaption, setDocCaption] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Student management states (tabel manajemen siswa)
  const [allStudents, setAllStudents] = useState([]);
  const [studentFilter, setStudentFilter] = useState('all'); // all | pending | active | rejected
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Student untuk statistik & absensi (selalu ambil semua)
  const [studentsForStats, setStudentsForStats] = useState([]);
  const [loadingStudentsStats, setLoadingStudentsStats] = useState(false);

  // Feedback management states
  const [allFeedback, setAllFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Schedule management states
  const [scheduleClass, setScheduleClass] = useState('A'); // A | B
  const [scheduleDay, setScheduleDay] = useState('1');     // 1..5
  const [scheduleSlots, setScheduleSlots] = useState([
    { start: '', end: '', title: '', note: '' }
  ]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Attendance states
  const [attendances, setAttendances] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]); // array of studentId yg hadir
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // ================== FETCH FUNCTIONS ==================

  const authHeader = token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      // admin: GET /api/notification → listAllNotifications
      const res = await fetch(`${API_URL}/notification`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    }
  };

  const fetchDocumentation = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/gallery`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching documentation:', err);
      setDocs([]);
    }
  };

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/attendance`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAttendances(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendances([]);
    }
  };

  // Admin list siswa (filter status)
  const fetchAllStudents = async () => {
    if (!token) return;
    setLoadingStudents(true);
    try {
      const statusFilter =
        studentFilter !== 'all' ? `?status=${studentFilter}` : '';
      const res = await fetch(`${API_URL}/student${statusFilter}`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAllStudents(Array.isArray(data) ? data : []);
      } else {
        setAllStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setAllStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Untuk statistik & absensi: ambil semua siswa tanpa filter
  const fetchStudentsForStats = async () => {
    if (!token) return;
    setLoadingStudentsStats(true);
    try {
      const res = await fetch(`${API_URL}/student`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setStudentsForStats(Array.isArray(data) ? data : []);
      } else {
        setStudentsForStats([]);
      }
    } catch (err) {
      console.error('Error fetching students for stats:', err);
      setStudentsForStats([]);
    } finally {
      setLoadingStudentsStats(false);
    }
  };

  const fetchAllFeedback = async () => {
    if (!token) return;
    setLoadingFeedback(true);
    try {
      // Admin/teacher: GET /api/feedback
      const res = await fetch(`${API_URL}/feedback`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAllFeedback(Array.isArray(data) ? data : []);
      } else {
        setAllFeedback([]);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setAllFeedback([]);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const fetchAllSchedules = async () => {
    if (!token) return;
    try {
      // GET /api/activities → getAllSchedules
      const res = await fetch(`${API_URL}/activities`, {
        headers: {
          ...authHeader
        },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAllSchedules(Array.isArray(data) ? data : []);
      } else {
        setAllSchedules([]);
      }
    } catch (err) {
      console.error('Error fetching all schedules:', err);
      setAllSchedules([]);
    }
  };

  // Ambil template jadwal per hari & kelas untuk form Edit Jadwal
  const fetchScheduleTemplate = async (cls = scheduleClass, day = scheduleDay) => {
    if (!token) return;
    setLoadingTemplate(true);
    try {
      const params = new URLSearchParams({
        class: cls,
        day: String(day)
      });
      // GET /api/activities/jadwal?class=A&day=1
      const res = await fetch(
        `${API_URL}/activities/jadwal?${params.toString()}`,
        {
          headers: {
            ...authHeader
          },
          signal: AbortSignal.timeout(5000)
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.slots) && data.slots.length > 0) {
          setScheduleSlots(
            data.slots.map((s) => ({
              start: s.start,
              end: s.end,
              title: s.title,
              note: s.note || ''
            }))
          );
        } else {
          setScheduleSlots([{ start: '', end: '', title: '', note: '' }]);
        }
      } else {
        console.warn('Gagal mengambil template jadwal, status:', res.status);
        setScheduleSlots([{ start: '', end: '', title: '', note: '' }]);
      }
    } catch (err) {
      console.error('Error fetching schedule template:', err);
      setScheduleSlots([{ start: '', end: '', title: '', note: '' }]);
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ================== EFFECTS ==================

  // pertama kali load data global
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;

    fetchNotifications();
    fetchAllSchedules();
    fetchDocumentation();
    fetchAttendance();
    fetchAllFeedback();
    fetchStudentsForStats();
  }, [token]);

  // refresh list siswa untuk tabel manajemen saat filter berubah
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;
    fetchAllStudents();
  }, [token, studentFilter]);

  // ambil template jadwal ketika kelas atau hari berubah
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;
    fetchScheduleTemplate(scheduleClass, scheduleDay);
  }, [token, scheduleClass, scheduleDay]);

  // ================== HANDLERS ==================

  const handleUpdateStudentStatus = async (studentId, newStatus, newKelas) => {
    try {
      const res = await fetch(`${API_URL}/student/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, kelas: newKelas })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('Status siswa berhasil diupdate');
        fetchAllStudents();
        fetchStudentsForStats(); // statistik ikut update
      } else {
        alert('Gagal mengupdate status: ' + (data.message || res.statusText));
      }
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  // Simpan absensi:
  // backend AttendanceSchema: { name, date, status }
  // Kita kirim 1 dokumen per siswa yg ditandai hadir.
  const handleMarkAttendance = async () => {
    if (typeof window === 'undefined' || !token) {
      alert('Harap login terlebih dahulu');
      return;
    }

    if (attendanceRecords.length === 0) {
      alert('Pilih minimal satu siswa');
      return;
    }

    const activeStudents = studentsForStats.filter(
      (s) => s.status === 'active'
    );

    const selectedStudents = activeStudents.filter((s) =>
      attendanceRecords.includes(String(s._id))
    );

    if (selectedStudents.length === 0) {
      alert('Data siswa tidak ditemukan. Coba refresh halaman.');
      return;
    }

    setLoadingAttendance(true);
    try {
      const results = await Promise.all(
        selectedStudents.map(async (stu) => {
          const body = {
            name: stu.nama,
            date: attendanceDate,
            status: 'Hadir'
          };

          const res = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: {
              ...authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000)
          });

          return { ok: res.ok, name: stu.nama };
        })
      );

      const failed = results.filter((r) => !r.ok);
      if (failed.length === 0) {
        alert('Absensi berhasil disimpan!');
      } else {
        alert(
          'Sebagian absensi gagal disimpan: ' +
            failed.map((f) => f.name).join(', ')
        );
      }

      setAttendanceRecords([]);
      fetchAttendance();
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!notifTitle || !notifBody) {
      alert('Judul dan deskripsi wajib diisi');
      return;
    }

    const payload = {
      title: notifTitle,
      body: notifBody,
      audience: notifAudience
    };

    if (notifAudience === 'byUser') {
      const usernames = notifUsernames
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      if (!usernames.length) {
        alert(
          'Masukkan minimal satu username untuk audiens "Pengguna Tertentu"'
        );
        return;
      }

      payload.recipientUsernames = usernames;
    }

    setLoadingNotif(true);
    try {
      const res = await fetch(`${API_URL}/notification`, {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const responseData = await res.json().catch(() => ({}));
      console.log('Notification response:', {
        status: res.status,
        ok: res.ok,
        data: responseData
      });

      if (res.ok) {
        alert('Notifikasi berhasil dikirim!');
        setNotifTitle('');
        setNotifBody('');
        setNotifAudience('all');
        setNotifUsernames('');
        fetchNotifications();
      } else {
        alert(
          'Gagal membuat notifikasi: ' +
            (responseData.message || res.statusText)
        );
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleAddSlot = () => {
    setScheduleSlots((prev) => [
      ...prev,
      { start: '', end: '', title: '', note: '' }
    ]);
  };

  const handleRemoveSlot = (idx) => {
    setScheduleSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSlotChange = (idx, field, value) => {
    setScheduleSlots((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveSchedule = async () => {
    if (scheduleSlots.some((s) => !s.start || !s.end || !s.title)) {
      alert('Semua field wajib diisi (start, end, title)');
      return;
    }

    setLoadingSchedule(true);
    try {
      const payload = {
        className: scheduleClass, // A atau B
        dayOfWeek: parseInt(scheduleDay, 10),
        slots: scheduleSlots
      };
      console.log('Saving schedule:', payload);

      // POST /api/activities/jadwal → setDaySchedule
      const res = await fetch(`${API_URL}/activities/jadwal`, {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const responseData = await res.json().catch(() => ({}));
      console.log('Schedule response:', {
        status: res.status,
        ok: res.ok,
        data: responseData
      });

      if (res.ok) {
        alert(
          'Jadwal berhasil disimpan! Wali-murid akan melihat perubahan segera.'
        );
        fetchScheduleTemplate(scheduleClass, scheduleDay);
        fetchAllSchedules();
      } else {
        alert(
          'Gagal menyimpan jadwal: ' +
            (responseData.message || res.statusText)
        );
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    if (typeof window === 'undefined' || !token) {
      alert('Harap login terlebih dahulu');
      return;
    }

    const file = e.target.files?.[0];
    if (!file || !docDate) {
      alert('Pilih file dan tanggal');
      return;
    }

    setLoadingDoc(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', docCaption || docDate);

    try {
      const res = await fetch(`${API_URL}/gallery/upload`, {
        method: 'POST',
        headers: {
          ...authHeader
        },
        body: formData,
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await res.json().catch(() => ({}));
      console.log('Upload response:', {
        status: res.status,
        ok: res.ok,
        data: responseData
      });

      if (res.ok) {
        alert('Dokumentasi berhasil diunggah!');
        setDocDate('');
        setDocCaption('');
        setDocFile(null);
        const fileInput = document.querySelector(
          'input[type="file"][accept*="image"]'
        );
        if (fileInput) fileInput.value = '';
        setTimeout(() => {
          fetchDocumentation();
        }, 500);
      } else {
        alert(
          'Gagal mengunggah dokumentasi: ' +
            (responseData.message || res.statusText)
        );
      }
    } catch (err) {
      console.error('Error uploading documentation:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoadingDoc(false);
    }
  };

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
  }

  // ================== DERIVED DATA (STATISTIK & AKTIVITAS) ==================

  const totalStudentsStat = studentsForStats.length;
  const totalClassesStat = new Set(
    studentsForStats
      .filter((s) => s.status === 'active')
      .map((s) => s.kelas)
      .filter(Boolean)
  ).size;
  const totalTeachersStat = new Set(
    (allSchedules || [])
      .map((s) => (s.createdBy?._id || s.createdBy))
      .filter(Boolean)
      .map((id) => String(id))
  ).size;

  const statsCards = [
    {
      id: 1,
      label: 'Total Murid',
      value: loadingStudentsStats ? '...' : totalStudentsStat,
      icon: '👥'
    },
    {
      id: 2,
      label: 'Kelas Aktif',
      value: loadingStudentsStats ? '...' : totalClassesStat,
      icon: '📚'
    },
    {
      id: 3,
      label: 'Guru Input Jadwal',
      value: totalTeachersStat,
      icon: '👨‍🏫'
    }
  ];

  // gabungkan notifikasi, feedback, dan pendaftaran siswa sebagai "aktivitas terbaru"
  const latestActivities = [
    ...notifications.map((n) => ({
      id: `notif-${n._id}`,
      icon: '🔔',
      title: n.title || 'Notifikasi',
      description: n.body || '',
      createdAt: n.createdAt
    })),
    ...allFeedback.map((f) => ({
      id: `feedback-${f._id}`,
      icon: '💬',
      title: `Feedback dari ${
        f.parentUserId?.username || 'Orang Tua'
      }`,
      description: f.feedback,
      createdAt: f.createdAt
    })),
    ...studentsForStats.map((s) => ({
      id: `stu-${s._id}`,
      icon: '🧒',
      title: `Pendaftaran siswa: ${s.nama}`,
      description: `Status: ${s.status || 'pending'} • Kelas: ${
        s.kelas || '-'
      }`,
      createdAt: s.createdAt
    }))
  ]
    .filter((x) => x.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // data siswa aktif untuk absensi
  const activeStudentsForAttendance = studentsForStats.filter(
    (s) => s.status === 'active'
  );

  // group absensi by tanggal
  const attendanceByDate = attendances.reduce((acc, rec) => {
    if (!rec.date) return acc;
    const dateStr = new Date(rec.date).toISOString().split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(rec);
    return acc;
  }, {});
  const attendanceDatesSorted = Object.keys(attendanceByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // ================== RENDER ==================

  return (
    <div className="umum-page">
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
        <div className="umum-nav-left sidebar-content">
          {/* MENU LIST */}
          <nav className="umum-nav-links sidebar-links">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className={`nav-item ${
                activeTab === 'dashboard' ? 'active' : ''
              }`}
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
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('notifications');
              }}
              className={`nav-item ${
                activeTab === 'notifications' ? 'active' : ''
              }`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/alarm.png"
                  alt="Notifikasi"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Notifikasi</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('editjadwal');
              }}
              className={`nav-item ${
                activeTab === 'editjadwal' ? 'active' : ''
              }`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Edit Jadwal"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Edit Jadwal</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('documentation');
              }}
              className={`nav-item ${
                activeTab === 'documentation' ? 'active' : ''
              }`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/profilanak.png"
                  alt="Dokumentasi"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Dokumentasi</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('students');
              }}
              className={`nav-item ${
                activeTab === 'students' ? 'active' : ''
              }`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/checklist.png"
                  alt="Manajemen Siswa"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Manajemen Siswa</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('feedback');
              }}
              className={`nav-item ${
                activeTab === 'feedback' ? 'active' : ''
              }`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/circular-arrows.png"
                  alt="Feedback"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Feedback</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('attendance');
              }}
              className={`nav-item ${
                activeTab === 'attendance' ? 'active' : ''
              }`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Absensi"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: 'auto' }}
                />
              </div>
              <span className="nav-label">Absensi</span>
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
                style={{ height: 'auto' }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="wali-sub-page" style={{ padding: '32px 48px' }}>
        {/* Header */}
        <div className="dashboard-greeting" style={{ marginBottom: '32px' }}>
          <h1
            style={{ fontSize: '28px', fontWeight: '700', color: '#123047' }}
          >
            Admin Dashboard
          </h1>
        </div>

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '32px'
              }}
            >
              {statsCards.map((stat) => (
                <div
                  key={stat.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      marginBottom: '8px',
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      opacity: 0.3
                    }}
                  >
                    {stat.icon}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: '#8fa9a9',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}
                  >
                    {stat.label}
                  </div>

                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      color: '#123047',
                      marginBottom: '4px'
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Activities Section */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#123047',
                  marginBottom: '20px'
                }}
              >
                Aktivitas Terkini
              </h2>

              {latestActivities.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Belum ada aktivitas terbaru.
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {latestActivities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: '#f8fafa',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: '#E5F0FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          flexShrink: 0
                        }}
                      >
                        {activity.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#123047',
                            marginBottom: '4px'
                          }}
                        >
                          {activity.title}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#8fa9a9'
                          }}
                        >
                          {activity.description}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginTop: '4px'
                          }}
                        >
                          {activity.createdAt
                            ? new Date(
                                activity.createdAt
                              ).toLocaleString('id-ID')
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <h2
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}
            >
              Kelola Notifikasi Real-time
            </h2>
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '24px'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Buat Notifikasi Baru
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Masukkan judul notifikasi"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Deskripsi Notifikasi
                </label>
                <textarea
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Masukkan deskripsi notifikasi"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Audiens
                </label>
                <select
                  value={notifAudience}
                  onChange={(e) => setNotifAudience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">Semua Pengguna</option>
                  <option value="parents">Hanya Orang Tua</option>
                  <option value="byUser">Pengguna Tertentu (by username)</option>
                </select>
              </div>

              {notifAudience === 'byUser' && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Username Penerima (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={notifUsernames}
                    onChange={(e) => setNotifUsernames(e.target.value)}
                    placeholder="contoh: bunda_adi, ayah_budi"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <button
                onClick={handleCreateNotification}
                disabled={loadingNotif}
                style={{
                  padding: '10px 20px',
                  background: loadingNotif ? '#ccc' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loadingNotif ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {loadingNotif ? 'Mengirim...' : 'Kirim Notifikasi'}
              </button>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Notifikasi Terbaru
              </h3>
              {notifications.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Belum ada notifikasi
                </p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif._id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        fontSize: '14px'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: '600',
                          color: '#123047'
                        }}
                      >
                        {notif.title}
                      </div>
                      <div
                        style={{
                          color: '#666',
                          fontSize: '13px',
                          marginTop: '4px'
                        }}
                      >
                        {notif.body}
                      </div>
                      <div
                        style={{
                          color: '#999',
                          fontSize: '12px',
                          marginTop: '4px'
                        }}
                      >
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleString('id-ID')
                          : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Edit Jadwal */}
        {activeTab === 'editjadwal' && (
          <div>
            <h2
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}
            >
              Kelola Jadwal Pembelajaran
            </h2>
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '24px'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Edit Jadwal Kelas
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Kelas
                  </label>
                  <select
                    value={scheduleClass}
                    onChange={(e) => setScheduleClass(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="A">Kelas A</option>
                    <option value="B">Kelas B</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Hari
                  </label>
                  <select
                    value={scheduleDay}
                    onChange={(e) => setScheduleDay(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="1">Senin</option>
                    <option value="2">Selasa</option>
                    <option value="3">Rabu</option>
                    <option value="4">Kamis</option>
                    <option value="5">Jumat</option>
                  </select>
                </div>
              </div>

              {loadingTemplate && (
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: 8 }}>
                  Memuat template jadwal...
                </p>
              )}

              <div style={{ marginBottom: '16px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}
                >
                  Slot Kegiatan
                </h4>
                <div
                  style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  {scheduleSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '1fr 1fr minmax(0,2fr) minmax(0,2fr) auto',
                        gap: '8px',
                        marginBottom: '12px',
                        padding: '12px',
                        background: '#f9f9f9',
                        borderRadius: '6px',
                        alignItems: 'end'
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px'
                          }}
                        >
                          Mulai
                        </label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            handleSlotChange(idx, 'start', e.target.value)
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px'
                          }}
                        >
                          Selesai
                        </label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            handleSlotChange(idx, 'end', e.target.value)
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px'
                          }}
                        >
                          Kegiatan
                        </label>
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) =>
                            handleSlotChange(idx, 'title', e.target.value)
                          }
                          placeholder="Nama kegiatan"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '4px'
                          }}
                        >
                          Catatan
                        </label>
                        <input
                          type="text"
                          value={slot.note}
                          onChange={(e) =>
                            handleSlotChange(idx, 'note', e.target.value)
                          }
                          placeholder="Catatan tambahan"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(idx)}
                        style={{
                          padding: '6px 10px',
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  onClick={handleAddSlot}
                  style={{
                    padding: '10px 16px',
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    border: '1px solid #2e7d32',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  + Tambah Slot
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={loadingSchedule}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: loadingSchedule ? '#ccc' : '#04291e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loadingSchedule ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {loadingSchedule ? 'Menyimpan...' : '✓ Simpan Jadwal'}
                </button>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Daftar Jadwal Tersimpan
              </h3>
              {allSchedules.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Belum ada jadwal tersimpan
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {allSchedules.map((sched) => (
                    <div
                      key={sched._id}
                      style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #04291e'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#123047',
                          marginBottom: '4px'
                        }}
                      >
                        Kelas {sched.className || '-'}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#123047',
                          marginBottom: '4px'
                        }}
                      >
                        {DAY_NAMES[sched.dayOfWeek] || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Jumlah slot: {sched.slots?.length || 0}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '8px'
                        }}
                      >
                        {sched.slots?.map((s, i) => (
                          <div key={i}>
                            {s.start} - {s.end}: {s.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Documentation */}
        {activeTab === 'documentation' && (
          <div>
            <h2
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}
            >
              Kelola Dokumentasi KBM
            </h2>
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '24px'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Upload Dokumentasi Baru
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Tanggal Dokumentasi
                </label>
                <input
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid ',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Catatan / Deskripsi Kegiatan
                </label>
                <textarea
                  value={docCaption}
                  onChange={(e) => setDocCaption(e.target.value)}
                  placeholder="Masukkan catatan tentang kegiatan KBM (opsional)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  File Gambar
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    id="docFileInput"
                    onChange={(e) => {
                      setDocFile(e.target.files?.[0] || null);
                    }}
                    accept="image/*"
                    style={{
                      display: 'none'
                    }}
                  />
                  <button
                    onClick={() =>
                      document.getElementById('docFileInput').click()
                    }
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px dashed #8fa9a9',
                      borderRadius: '8px',
                      background: '#f8fafa',
                      color: '#123047',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    📸 Pilih Foto Kegiatan KBM
                  </button>
                  {docFile && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#04291e',
                        marginTop: '8px'
                      }}
                    >
                      ✓ File dipilih: {docFile.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (!docDate || !docFile) {
                    alert('Pilih tanggal dan file terlebih dahulu');
                    return;
                  }
                  const event = { target: { files: [docFile] } };
                  handleDocumentUpload(event);
                }}
                disabled={loadingDoc || !docDate || !docFile}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: loadingDoc ? '#ccc' : '#04291e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loadingDoc ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loadingDoc ? 0.6 : 1
                }}
              >
                {loadingDoc ? '⏳ Mengirim...' : '✓ Kirim Dokumentasi'}
              </button>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Dokumentasi Terbaru
              </h3>
              {docs.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Belum ada dokumentasi
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {docs.slice(0, 12).map((doc) => (
                    <div
                      key={doc._id}
                      style={{
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center'
                      }}
                    >
                      {doc.imageUrl && (
                        // kalau gallery controller kamu pakai field berbeda,
                        // bisa disesuaikan di sini
                        <img
                          src={doc.imageUrl}
                          alt="doc"
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            marginBottom: '8px'
                          }}
                        />
                      )}
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {(() => {
                          try {
                            const dateObj = new Date(doc.createdAt);
                            return !isNaN(dateObj.getTime())
                              ? dateObj.toLocaleDateString('id-ID')
                              : 'Tanggal tidak valid';
                          } catch (e) {
                            return 'Tanggal tidak valid';
                          }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Attendance */}
        {activeTab === 'attendance' && (
          <div>
            <h2
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}
            >
              Kelola Absensi Siswa
            </h2>
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '24px'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Catat Absensi Baru
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Tanggal
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Pilih Siswa Hadir (status active)
                </label>

                {activeStudentsForAttendance.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Belum ada siswa aktif. Pastikan admin sudah menyetujui
                    pendaftaran dan mengubah status menjadi <b>active</b>.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    {activeStudentsForAttendance.map((student) => (
                      <label
                        key={student._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: attendanceRecords.includes(
                            String(student._id)
                          )
                            ? '#e8f5e9'
                            : '#fff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={attendanceRecords.includes(
                            String(student._id)
                          )}
                          onChange={(e) => {
                            const studentId = String(student._id);
                            if (e.target.checked) {
                              setAttendanceRecords((prev) => [
                                ...prev,
                                studentId
                              ]);
                            } else {
                              setAttendanceRecords((prev) =>
                                prev.filter((id) => id !== studentId)
                              );
                            }
                          }}
                          style={{
                            marginRight: '8px',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span style={{ fontSize: '14px' }}>{student.nama}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleMarkAttendance}
                disabled={loadingAttendance}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: loadingAttendance ? '#ccc' : '#04291e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loadingAttendance ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loadingAttendance ? '⏳ Menyimpan...' : '✓ Simpan Absensi'}
              </button>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h3
                style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
              >
                Riwayat Absensi
              </h3>
              {attendanceDatesSorted.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Belum ada data absensi
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px'
                  }}
                >
                  {attendanceDatesSorted.slice(0, 10).map((dateStr) => {
                    const recs = attendanceByDate[dateStr] || [];
                    const hadirCount = recs.filter(
                      (r) => r.status === 'Hadir'
                    ).length;
                    return (
                      <div
                        key={dateStr}
                        style={{
                          background: '#f5f5f5',
                          borderRadius: '8px',
                          padding: '12px',
                          borderLeft: '4px solid #04291e'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#123047',
                            marginBottom: '4px'
                          }}
                        >
                          {new Date(dateStr).toLocaleDateString('id-ID')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Siswa Hadir: {hadirCount} / {recs.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Students Management */}
        {activeTab === 'students' && (
          <div>
            <h2
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}
            >
              Manajemen Siswa
            </h2>
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '24px'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Filter Status
                </label>
                <select
                  value={studentFilter}
                  onChange={(e) => {
                    setStudentFilter(e.target.value);
                  }}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">Semua Siswa</option>
                  <option value="pending">Pending</option>
                  <option value="active">Aktif</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {loadingStudents ? (
                <p style={{ color: '#666' }}>Memuat data siswa...</p>
              ) : allStudents.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Tidak ada siswa
                </p>
              ) : (
                <div
                  style={{
                    overflowX: 'auto',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: '#f5f5f5',
                          borderBottom: '2px solid #ddd'
                        }}
                      >
                        <th
                          style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Nama
                        </th>
                        <th
                          style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Kelas
                        </th>
                        <th
                          style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Pembayaran
                        </th>
                        <th
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents.map((student) => (
                        <tr
                          key={student._id}
                          style={{ borderBottom: '1px solid #eee' }}
                        >
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            {student.nama}
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background:
                                  student.status === 'active'
                                    ? '#e8f5e9'
                                    : student.status === 'pending'
                                    ? '#fff3e0'
                                    : '#ffebee',
                                color:
                                  student.status === 'active'
                                    ? '#2e7d32'
                                    : student.status === 'pending'
                                    ? '#f57c00'
                                    : '#c62828'
                              }}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            <select
                              value={student.kelas || ''}
                              onChange={(e) =>
                                handleUpdateStudentStatus(
                                  student._id,
                                  student.status,
                                  e.target.value || null
                                )
                              }
                              style={{
                                padding: '6px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            >
                              <option value="">Belum Ditentukan</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background:
                                  student.paymentStatus === 'paid'
                                    ? '#e8f5e9'
                                    : student.paymentStatus === 'partial'
                                    ? '#fff3e0'
                                    : '#ffebee'
                              }}
                            >
                              {student.paymentStatus}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '13px'
                            }}
                          >
                            {student.status === 'pending' && (
                              <button
                                onClick={() =>
                                  handleUpdateStudentStatus(
                                    student._id,
                                    'active',
                                    student.kelas
                                  )
                                }
                                style={{
                                  padding: '6px 12px',
                                  background: '#4caf50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  marginRight: '4px'
                                }}
                              >
                                Terima
                              </button>
                            )}
                            {student.status !== 'rejected' && (
                              <button
                                onClick={() =>
                                  handleUpdateStudentStatus(
                                    student._id,
                                    'rejected',
                                    student.kelas
                                  )
                                }
                                style={{
                                  padding: '6px 12px',
                                  background: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Tolak
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Feedback Review */}
        {activeTab === 'feedback' && (
          <div>
            <h2
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}
            >
              Ulasan Feedback Orang Tua
            </h2>
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {loadingFeedback ? (
                <p style={{ color: '#666' }}>Memuat feedback...</p>
              ) : allFeedback.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Belum ada feedback
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  {allFeedback.map((feedback) => (
                    <div
                      key={feedback._id}
                      style={{
                        background: '#f9f9f9',
                        padding: '16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #04291e'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '8px'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#123047'
                            }}
                          >
                            {feedback.parentUserId?.username || 'Orang Tua'}
                          </div>
                          <div
                            style={{ fontSize: '12px', color: '#999' }}
                          >
                            {feedback.createdAt
                              ? new Date(
                                  feedback.createdAt
                                ).toLocaleString('id-ID')
                              : ''}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            background: '#e3f2fd',
                            color: '#0d47a1',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          Feedback #
                          {feedback._id
                            ? String(feedback._id).slice(-6)
                            : '???'}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#333',
                          marginTop: '12px'
                        }}
                      >
                        {feedback.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
