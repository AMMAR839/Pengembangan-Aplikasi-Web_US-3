'use client';

import { useState } from 'react';

const statsData = [
  { 
    id: 1, 
    label: 'Total Murid', 
    value: '43', 
    trend: '+14%',
    trendPositive: true,
    icon: '👥'
  },
  { 
    id: 2, 
    label: 'Total Kelas Aktif', 
    value: '5', 
    trend: '-',
    trendPositive: true,
    icon: '📚'
  },
  { 
    id: 3, 
    label: 'Total Guru Aktif', 
    value: '5', 
    trend: '-',
    trendPositive: true,
    icon: '👨‍🏫'
  }
];

const activitiesData = [
  { 
    id: 1, 
    icon: '📧',
    title: 'New Lorem arumod Aua',
    description: 'Tegretian peraturan informasi',
    bgColor: '#FFE5E5'
  },
  { 
    id: 2, 
    icon: '💳',
    title: 'Payment received from edi',
    description: 'Tegretian peraturan informasi',
    bgColor: '#E5F0FF'
  },
  { 
    id: 3, 
    icon: '📅',
    title: 'Attendance marked for TK A',
    description: 'Tegretian peraturan informasi',
    bgColor: '#E5FFE5'
  },
  { 
    id: 4, 
    icon: '📝',
    title: 'New report Unit 1 is downloaded',
    description: 'Tegretian peraturan informasi',
    bgColor: '#FFF5E5'
  }
];

export default function AdminDashboardNew() {
  const [activeNav, setActiveNav] = useState('dashboard');

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
          <img
            src="/images/logo.png"
            alt="Little Garden Logo"
            width="70"
            height="40"
            className="umum-logo-image"
            style={{ height: "auto" }}
          />
        </div>

        {/* BOTTOM ICONS */}
        <div className="umum-nav-right sidebar-actions">
          <button className="umum-icon-btn" type="button">
            <div className="umum-logo sidebar-logo">
              <img
                src="/images/profil.png"
                alt="Profil"
                width="25"
                height="40"
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
              <img
                src="/images/setting.png"
                alt="Pengaturan"
                width="30"
                height="40"
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
    </div>
  );
}