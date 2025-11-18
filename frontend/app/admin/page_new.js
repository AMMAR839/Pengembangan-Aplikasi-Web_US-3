'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Stat Card Component
const StatCard = ({ icon, label, value, trend, details }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-4">
      <span className="text-3xl">{icon}</span>
      {trend && <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    {details && <p className="text-xs text-gray-500 mt-2">{details}</p>}
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!storedToken || userRole !== 'admin') {
      router.push('/');
      return;
    }
    
    setToken(storedToken);
    fetchDashboardData(storedToken);
  }, [router]);

  // Fetch dashboard statistics
  const fetchDashboardData = async (authToken) => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, studentsRes, teachersRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/students?limit=5`, { headers }),
        fetch(`${API_URL}/admin/teachers`, { headers }),
        fetch(`${API_URL}/admin/payments`, { headers })
      ]);

      if (!statsRes.ok || !studentsRes.ok || !teachersRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsRes.json();
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      const paymentsData = await paymentsRes.json();

      setStats(statsData);
      setStudents(studentsData.students || []);
      setTeachers(teachersData || []);
      setPayments(paymentsData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment approval/rejection
  const handlePaymentUpdate = async (paymentId, status) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${API_URL}/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to update payment');

      // Refresh payments
      const paymentsRes = await fetch(`${API_URL}/admin/payments`, { headers });
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData || []);
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Gagal memperbarui pembayaran');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Selamat datang di panel administrasi PAUD</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'students', 'teachers', 'payments', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && '📊 '}
                {tab === 'students' && '👥 '}
                {tab === 'teachers' && '👨‍🏫 '}
                {tab === 'payments' && '💳 '}
                {tab === 'settings' && '⚙️ '}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon="👥"
                label="Total Murid"
                value={stats?.totalStudents || 0}
                details={`${stats?.totalStudents || 0} siswa terdaftar`}
              />
              <StatCard
                icon="👨‍🏫"
                label="Total Guru"
                value={stats?.totalTeachers || 0}
                details={`${stats?.totalTeachers || 0} guru aktif`}
              />
              <StatCard
                icon="💳"
                label="Pembayaran"
                value={`Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`}
                details={`${stats?.completedPayments || 0} pembayaran terselesaikan`}
              />
              <StatCard
                icon="⏳"
                label="Menunggu Verifikasi"
                value={stats?.pendingPayments || 0}
                details={`${stats?.pendingPayments || 0} pembayaran pending`}
              />
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Box */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Ringkasan Singkat</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Total Pengguna</span>
                    <span className="font-semibold">{stats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Kehadiran Tercatat</span>
                    <span className="font-semibold">{stats?.totalAttendance || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status Sistem</span>
                    <span className="text-green-500 font-semibold">✓ Aktif</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Aksi Cepat</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded font-medium transition text-left">
                    ➕ Tambah Murid Baru
                  </button>
                  <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded font-medium transition text-left">
                    ➕ Tambah Guru
                  </button>
                  <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded font-medium transition text-left">
                    📋 Lihat Laporan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Daftar Murid</h2>
              <p className="text-gray-600 text-sm mt-1">Menampilkan {students.length} murid</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIK</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.nik || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.classroom || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : student.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          student.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.paymentStatus === 'paid' ? '✓ Lunas' : '✗ Menunggu'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada data murid
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Daftar Guru</h2>
              <p className="text-gray-600 text-sm mt-1">Menampilkan {teachers.length} guru</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{teacher.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ✓ Aktif
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teachers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada data guru
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Verifikasi Pembayaran</h2>
              <p className="text-gray-600 text-sm mt-1">Menampilkan {payments.length} pembayaran menunggu</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {payment.studentId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Rp {(payment.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {payment.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handlePaymentUpdate(payment._id, 'approved')}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium"
                        >
                          ✓ Setuju
                        </button>
                        <button
                          onClick={() => handlePaymentUpdate(payment._id, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium"
                        >
                          ✗ Tolak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada pembayaran menunggu verifikasi
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">⚙️ Pengaturan</h2>
            <div className="space-y-6">
              <div className="pb-6 border-b">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Pengaturan Sistem</h3>
                <p className="text-gray-600 text-sm mb-4">Konfigurasi pengaturan aplikasi secara umum</p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Buka Pengaturan Lanjutan
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Backup Data</h3>
                <p className="text-gray-600 text-sm mb-4">Kelola backup database dan file sistem</p>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Buat Backup Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
