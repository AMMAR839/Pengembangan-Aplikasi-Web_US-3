'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Original stats and activities data
const statsData = [
  { 
    id: 1, 
    label: 'Total Murid', 
    value: '43', 
    trend: '+14%',
    trendPositive: true,
    icon: 'ðŸ‘¥'
  },
  { 
    id: 2, 
    label: 'Total Kelas Aktif', 
    value: '5', 
    trend: '-',
    trendPositive: true,
    icon: 'ðŸ“š'
  },
  { 
    id: 3, 
    label: 'Total Guru Aktif', 
    value: '5', 
    trend: '-',
    trendPositive: true,
    icon: 'ðŸ‘¨â€ðŸ«'
  }
];

const activitiesData = [
  { 
    id: 1, 
    icon: 'ðŸ“§',
    title: 'New Lorem arumod Aua',
    description: 'Tegretian peraturan informasi',
    bgColor: '#FFE5E5'
  },
  { 
    id: 2, 
    icon: 'ðŸ’³',
    title: 'Payment received from edi',
    description: 'Tegretian peraturan informasi',
    bgColor: '#E5F0FF'
  },
  { 
    id: 3, 
    icon: 'ðŸ“…',
    title: 'Attendance marked for TK A',
    description: 'Tegretian peraturan informasi',
    bgColor: '#E5FFE5'
  },
  { 
    id: 4, 
    icon: 'ðŸ“',
    title: 'New report Unit 1 is downloaded',
    description: 'Tegretian peraturan informasi',
    bgColor: '#FFF5E5'
  }
];

export default function AdminDashboardNew() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifAudience, setNotifAudience] = useState('all');
  const [loadingNotif, setLoadingNotif] = useState(false);
  
  // Schedule states
  const [schedules, setSchedules] = useState([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleActivities, setScheduleActivities] = useState('');
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Documentation states
  const [docs, setDocs] = useState([]);
  const [docDate, setDocDate] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  
  // Schedule management states
  const [scheduleDay, setScheduleDay] = useState('1');
  const [scheduleSlots, setScheduleSlots] = useState([{ start: '', end: '', title: '', note: '' }]);
  const [allSchedules, setAllSchedules] = useState([]);
  
  // Attendance states
  const [attendances, setAttendances] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [studentsList, setStudentsList] = useState([
    { id: 1, name: 'Adi Suryanto' },
    { id: 2, name: 'Budi Santoso' },
    { id: 3, name: 'Citra Dewi' },
    { id: 4, name: 'Doni Hermawan' },
    { id: 5, name: 'Eka Putri' }
  ]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // Fetch all data on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;
    
    fetchNotifications();
    fetchAllSchedules();
    fetchDocumentation();
    fetchAttendance();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notification`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_URL}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setSchedules([]);
    }
  };

  const fetchDocumentation = async () => {
    try {
      const res = await fetch(`${API_URL}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) {
      console.error('Error fetching documentation:', err);
      setDocs([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/notification`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setAnnouncements([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_URL}/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAttendances(data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendances([]);
    }
  };

  const handleMarkAttendance = async () => {
    if (typeof window === 'undefined' || !token) {
      alert('Harap login terlebih dahulu');
      return;
    }

    if (attendanceRecords.length === 0) {
      alert('Pilih minimal satu siswa');
      return;
    }

    setLoadingAttendance(true);
    try {
      const res = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: attendanceDate,
          studentIds: attendanceRecords
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        alert('Absensi berhasil disimpan!');
        setAttendanceRecords([]);
        fetchAttendance();
      } else {
        alert('Gagal menyimpan absensi');
      }
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

    setLoadingNotif(true);
    try {
      const res = await fetch(`${API_URL}/notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: notifTitle,
          body: notifBody,
          audience: notifAudience
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        alert('Notifikasi berhasil dikirim!');
        setNotifTitle('');
        setNotifBody('');
        setNotifAudience('all');
        fetchNotifications();
      } else {
        alert('Gagal membuat notifikasi');
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoadingNotif(false);
    }
  };

  const fetchAllSchedules = async () => {
    try {
      const res = await fetch(`${API_URL}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        setAllSchedules(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching all schedules:', err);
      setAllSchedules([]);
    }
  };

  const handleAddSlot = () => {
    setScheduleSlots([...scheduleSlots, { start: '', end: '', title: '', note: '' }]);
  };

  const handleRemoveSlot = (idx) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== idx));
  };

  const handleSlotChange = (idx, field, value) => {
    const updated = [...scheduleSlots];
    updated[idx][field] = value;
    setScheduleSlots(updated);
  };

  const handleSaveSchedule = async () => {
    if (scheduleSlots.some(s => !s.start || !s.end || !s.title)) {
      alert('Semua field wajib diisi (start, end, title)');
      return;
    }

    setLoadingSchedule(true);
    try {
      const res = await fetch(`${API_URL}/activities/jadwal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dayOfWeek: parseInt(scheduleDay),
          slots: scheduleSlots
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        alert('Jadwal berhasil disimpan! Wali-murid akan melihat perubahan secara real-time.');
        setScheduleSlots([{ start: '', end: '', title: '', note: '' }]);
        fetchAllSchedules();
      } else {
        const error = await res.json();
        alert('Gagal menyimpan jadwal: ' + error.message);
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
    formData.append('file', file);
    formData.append('date', docDate);

    try {
      const res = await fetch(`${API_URL}/gallery/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
        signal: AbortSignal.timeout(15000)
      });

      if (res.ok) {
        alert('Dokumentasi berhasil diunggah!');
        setDocDate('');
        setDocFile(null);
        fetchDocumentation();
      } else {
        alert('Gagal mengunggah dokumentasi');
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
    }
    window.location.href = '/';
  }

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
            style={{ height: "auto" }}
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
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
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
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('notifications');
              }}
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Notifikasi"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
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
              className={`nav-item ${activeTab === 'editjadwal' ? 'active' : ''}`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Edit Jadwal"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
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
              className={`nav-item ${activeTab === 'documentation' ? 'active' : ''}`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/profilanak.png"
                  alt="Dokumentasi"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
                />
              </div>
              <span className="nav-label">Dokumentasi</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('attendance');
              }}
              className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            >
              <div className="umum-logo sidebar-logo">
                <Image
                  src="/images/jadwal.png"
                  alt="Absensi"
                  width={20}
                  height={40}
                  className="umum-logo-image"
                  style={{ height: "auto" }}
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
                style={{ height: "auto" }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="wali-sub-page" style={{ padding: '32px 48px' }}>
        {/* Header */}
        <div className="dashboard-greeting" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#123047' }}>
            Admin Dashboard
          </h1>
        </div>

        {/* TAB: Dashboard (ORIGINAL VIEW) */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              {statsData.map((stat) => (
                <div key={stat.id} style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  position: 'relative'
                }}>
                  <div style={{ 
                    fontSize: '32px', 
                    marginBottom: '8px',
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    opacity: '0.3'
                  }}>
                    {stat.icon}
                  </div>
                  
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#8fa9a9',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                  
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '700',
                    color: '#123047',
                    marginBottom: '4px'
                  }}>
                    {stat.value}
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px',
                    color: stat.trendPositive ? '#4caf50' : '#f44336',
                    fontWeight: '600'
                  }}>
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Activities Section */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700',
                color: '#123047',
                marginBottom: '20px'
              }}>
                Aktivitas Terkini
              </h2>

              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {activitiesData.map((activity) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#f8fafa',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: activity.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}>
                      {activity.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#123047',
                        marginBottom: '4px'
                      }}>
                        {activity.title}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#8fa9a9'
                      }}>
                        {activity.description}
                      </div>
                    </div>

                    <button style={{
                      padding: '6px 12px',
                      background: '#e6f0f0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#123047',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      Lihat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Kelola Notifikasi Real-time
            </h2>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Buat Notifikasi Baru
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
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
                  <option value="byUser">Pengguna Tertentu</option>
                </select>
              </div>
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

            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Notifikasi Terbaru
              </h3>
              {notifications.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>Belum ada notifikasi</p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif._id} style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: '600', color: '#123047' }}>{notif.title}</div>
                      <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>{notif.body}</div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        {new Date(notif.createdAt).toLocaleString('id-ID')}
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Kelola Jadwal Pembelajaran
            </h2>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Edit Jadwal Kelas
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
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

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Slot Kegiatan</h4>
                <div style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  {scheduleSlots.map((slot, idx) => (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 2fr 2fr auto',
                      gap: '8px',
                      marginBottom: '12px',
                      padding: '12px',
                      background: '#f9f9f9',
                      borderRadius: '6px',
                      alignItems: 'end'
                    }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                          Mulai
                        </label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => handleSlotChange(idx, 'start', e.target.value)}
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
                        <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                          Selesai
                        </label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => handleSlotChange(idx, 'end', e.target.value)}
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
                        <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                          Kegiatan
                        </label>
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) => handleSlotChange(idx, 'title', e.target.value)}
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
                        <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                          Catatan
                        </label>
                        <input
                          type="text"
                          value={slot.note}
                          onChange={(e) => handleSlotChange(idx, 'note', e.target.value)}
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

            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Daftar Jadwal Tersimpan
              </h3>
              {allSchedules.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>Belum ada jadwal tersimpan</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {allSchedules.map((sched) => (
                    <div key={sched._id} style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #04291e'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#123047', marginBottom: '8px' }}>
                        {['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][sched.dayOfWeek]}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Jumlah slot: {sched.slots?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                        {sched.slots?.map((s, i) => (
                          <div key={i}>{s.start} - {s.end}: {s.title}</div>
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Kelola Dokumentasi KBM
            </h2>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Upload Dokumentasi Baru
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Tanggal Dokumentasi
                </label>
                <input
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
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
                    onClick={() => document.getElementById('docFileInput').click()}
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
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e8f0f0';
                      e.target.style.borderColor = '#04291e';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8fafa';
                      e.target.style.borderColor = '#8fa9a9';
                    }}
                  >
                    📸 Pilih Foto Kegiatan KBM
                  </button>
                  {docFile && (
                    <p style={{ fontSize: '13px', color: '#04291e', marginTop: '8px' }}>
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
                onMouseEnter={(e) => {
                  if (!loadingDoc && docDate && docFile) {
                    e.target.style.background = '#052826';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingDoc && docDate && docFile) {
                    e.target.style.background = '#04291e';
                  }
                }}
              >
                {loadingDoc ? '⏳ Mengirim...' : '✓ Kirim Dokumentasi'}
              </button>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Dokumentasi Terbaru
              </h3>
              {docs.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>Belum ada dokumentasi</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '16px'
                }}>
                  {docs.slice(0, 6).map((doc) => (
                    <div key={doc._id} style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      {doc.imageUrl && (
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
                        {new Date(doc.createdAt).toLocaleDateString('id-ID')}
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Kelola Absensi Siswa
            </h2>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Catat Absensi Baru
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Pilih Siswa Hadir
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px'
                }}>
                  {studentsList.map((student) => (
                    <label key={student.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: attendanceRecords.includes(student.id) ? '#e8f5e9' : '#fff'
                    }}>
                      <input
                        type="checkbox"
                        checked={attendanceRecords.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAttendanceRecords([...attendanceRecords, student.id]);
                          } else {
                            setAttendanceRecords(attendanceRecords.filter(id => id !== student.id));
                          }
                        }}
                        style={{ marginRight: '8px', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px' }}>{student.name}</span>
                    </label>
                  ))}
                </div>
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

            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Riwayat Absensi
              </h3>
              {attendances.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>Belum ada data absensi</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  {attendances.slice(0, 10).map((att, idx) => (
                    <div key={idx} style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '12px',
                      borderLeft: '4px solid #04291e'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#123047', marginBottom: '4px' }}>
                        {new Date(att.date || att.createdAt).toLocaleDateString('id-ID')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Siswa Hadir: {att.studentIds?.length || 0}
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
