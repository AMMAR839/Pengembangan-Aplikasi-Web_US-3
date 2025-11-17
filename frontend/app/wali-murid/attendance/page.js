'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AttendancePage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('attendance');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAttendanceDetails();
    }
  }, []);

  const fetchAttendanceDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Use dummy data if no token
        setAttendanceData(generateDummyAttendance());
        calculateStats(generateDummyAttendance());
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/attendance/my-details`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data.records || []);
        setAttendanceStats({
          totalDays: data.totalDays || 0,
          presentDays: data.presentDays || 0,
          absentDays: data.absentDays || 0,
          percentage: Math.round((data.presentDays / data.totalDays) * 100) || 0
        });
      } else {
        // Use dummy data on error
        const dummy = generateDummyAttendance();
        setAttendanceData(dummy);
        calculateStats(dummy);
      }
    } catch (err) {
      console.error('Error fetching attendance details:', err);
      const dummy = generateDummyAttendance();
      setAttendanceData(dummy);
      calculateStats(dummy);
    } finally {
      setLoading(false);
    }
  };

  const generateDummyAttendance = () => {
    const records = [];
    const today = new Date();
    for (let i = 19; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      records.push({
        date: date.toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'present' : 'absent',
        dateFormatted: date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      });
    }
    return records;
  };

  const calculateStats = (records) => {
    const present = records.filter(r => r.status === 'present').length;
    const total = records.length;
    const absent = total - present;
    setAttendanceStats({
      totalDays: total,
      presentDays: present,
      absentDays: absent,
      percentage: Math.round((present / total) * 100) || 0
    });
  };

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
      {/* SIDEBAR */}
      <aside className="umum-nav sidebar-layout">
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
              href="/wali-murid/attendance"
              className={`nav-item ${activeNav === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveNav('attendance')}
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

      {/* CONTENT */}
      <div className="wali-sub-page">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="wali-sub-page-title">Detail Absensi</div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
          maxWidth: '1000px',
          margin: '0 auto 32px'
        }}>
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#04291e', marginBottom: '4px' }}>
              {attendanceStats.percentage}%
            </div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
              Presentase Kehadiran
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2ecc71', marginBottom: '4px' }}>
              {attendanceStats.presentDays}
            </div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
              Hari Hadir
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#e74c3c', marginBottom: '4px' }}>
              {attendanceStats.absentDays}
            </div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
              Hari Tidak Hadir
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3498db', marginBottom: '4px' }}>
              {attendanceStats.totalDays}
            </div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
              Total Hari
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '1000px',
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#123047' }}>
            Riwayat Kehadiran (20 Hari Terakhir)
          </h2>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Mengambil data...</p>
          ) : attendanceData.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Belum ada data absensi</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              {attendanceData.map((record, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    background: record.status === 'present' ? '#e8f8f5' : '#fadbd8',
                    borderLeft: `4px solid ${record.status === 'present' ? '#2ecc71' : '#e74c3c'}`,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    {record.dateFormatted || new Date(record.date).toLocaleDateString('id-ID')}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: record.status === 'present' ? '#2ecc71' : '#e74c3c',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {record.status === 'present' ? '✓ Hadir' : '✗ Tidak Hadir'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
